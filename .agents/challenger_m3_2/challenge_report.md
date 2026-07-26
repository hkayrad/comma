# Adversarial Challenge Report — Milestone 3: AuditLog Service & Repository

## Challenge Summary

**Overall risk assessment**: HIGH

Empirical testing confirmed that code-level transaction propagation in `AuditLogService` and `AuditLogRepository` is correctly implemented. However, an **adversarial architectural flaw** was uncovered in `migration.sql`: the table creation DDL for `audit_logs` omits the `ENGINE=InnoDB` table option. On MariaDB/MySQL installations where the default storage engine is MyISAM, the table is created as non-transactional. Consequently, **audit log writes created within financial transactions ARE NOT ROLLED BACK when the enclosing transaction rolls back**, leaving ghost audit logs for mutations that never occurred. When converted to `ENGINE=InnoDB`, multi-tenant isolation and transaction propagation pass 100% of stress tests.

---

## Challenges

### [HIGH] Challenge 1: `migration.sql` Omits `ENGINE=InnoDB` causing Audit Log Persistence on Transaction Rollbacks in MyISAM Environments

- **Assumption challenged**: Assuming that passing Sequelize `transaction` parameters to `AuditLogs.create()` guarantees atomicity and rollback capability across all database configurations.
- **Attack scenario**:
  1. A financial mutation (e.g. creating a debt or payment) is wrapped in a managed transaction:
     ```ts
     await sequelize.transaction(async (t) => {
       await DebtRepository.create(debtData, t);
       await AuditLogService.recordAction(auditDto, t);
       throw new Error("Validation failure - rollback debt");
     });
     ```
  2. In database environments where default storage engine is `MyISAM`, `audit_logs` is created as a MyISAM table during migration execution (`migration.sql` line 156).
  3. The transaction throws and rolls back. The debt creation is rolled back, but `audit_logs` table operations **ignore the rollback**.
  4. Empirical result: An audit log record exists for a debt creation that was never committed to the database.
- **Blast radius**: Audit trail corruption, phantom audit records for failed/rolled-back financial transactions, loss of audit integrity, silent failure of foreign key constraints (`fk_audit_logs_company` and `fk_audit_logs_user`).
- **Mitigation**: Update `migration.sql` line 170 to explicitly append `ENGINE=InnoDB`:
  ```sql
  CREATE TABLE IF NOT EXISTS audit_logs (
      ...
  ) ENGINE=InnoDB;
  ```
  Ensure all model setup / test schema creation DDL explicitly specifies `ENGINE=InnoDB`.

---

### [LOW] Challenge 2: Lack of Optional Transaction Parameter in `AuditLogRepository.findAllWithPagination`

- **Assumption challenged**: Read operations on `AuditLogRepository.findAllWithPagination` and `AuditLogService.getLogs` do not require explicit transaction handles.
- **Attack scenario**: If a service caller attempts to read audit logs within an uncommitted active transaction (e.g. read-your-own-writes before commit under Repeatable Read / Serializable isolation), `AuditLogService.getLogs` cannot accept a transaction object.
- **Blast radius**: Minor limitation for read-your-own-writes scenarios within complex business operations.
- **Mitigation**: Add optional `transaction?: Transaction` parameter to `AuditLogRepository.findAllWithPagination` and `AuditLogService.getLogs`.

---

## Stress Test Results

Test File Executed: `server/src/tests/services/AuditLogChallengerM3.test.ts`

| Scenario | Expected Behavior | Actual Behavior | Result |
|----------|-------------------|-----------------|--------|
| **Managed Tx Rollback (Default DDL without ENGINE=InnoDB)** | Audit log rolled back on error | Audit log **PERMANENTLY PERSISTED** in DB (MyISAM non-transactional) | **FAIL** (Defect Uncovered) |
| **Managed Tx Rollback (InnoDB Table Engine)** | Audit log rolled back on error | Audit log discarded, `findByPk` returns `null` | **PASS** |
| **Managed Tx Commit (InnoDB)** | Audit log committed with tx | Audit log persisted in DB | **PASS** |
| **Unmanaged Tx Rollback (InnoDB)** | `t.rollback()` discards log | Log discarded, `findByPk` returns `null` | **PASS** |
| **Unmanaged Tx Commit (InnoDB)** | `t.commit()` persists log | Log persisted in DB | **PASS** |
| **High Concurrency Multi-Company Writes (5 Co, 90 parallel ops)** | 100% strict company isolation, 0 cross-tenant leak | All 5 companies received exact expected counts; 0 cross-tenant leakage | **PASS** |
| **Filter Injection Defense (`company_id` in user filters)** | User filter `company_id` cannot override parameter | Only requested `company_id` records returned | **PASS** |
| **SQL/ORM Injection Defense (Filter payloads)** | Parameterized queries escape malicious strings | Queries executed safely, 0 isolation breach | **PASS** |
| **Sorting Security (Non-whitelisted columns)** | Fallback to `[["created_at", "DESC"]]` | Fallback executed, no SQL errors | **PASS** |
| **Pagination Edge Cases (`page: -5, limit: -100`)** | Normalization to `page: 1, limit: 20` | Normalized correctly | **PASS** |

---

## Unchallenged Areas

- **Database Performance under Millions of Rows**: Stress tests evaluated 90 parallel operations across 5 companies. Production load with millions of records will depend on database indexing (`idx_audit_logs_company_created_at` and `idx_audit_logs_company_entity`).
