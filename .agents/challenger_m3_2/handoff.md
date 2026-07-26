# Handoff Report - Challenger M3_2: Transaction Propagation & Multi-Tenant Isolation Verification

## 1. Observation
- Created and executed empirical test harness: `server/src/tests/services/AuditLogChallengerM3.test.ts`.
- Command executed:
  ```bash
  export PATH=/home/hkayrad/.nvm/versions/node/v24.18.0/bin:$PATH
  npm test --workspace=server AuditLogChallengerM3.test.ts
  ```
- **Initial Execution Output (Failure)**:
  - 4 failed / 7 passed out of 11 tests.
  - Failures:
    - `1b. Managed transaction rollback`: `AssertionError: expected AuditLogs to be null` (Received persisted record `id: "f8a9aaf4-0728-4117-ace3-c8c0e902a813"`).
    - `1c. Managed transaction rollback (batch)`: `AssertionError: expected 2 to be +0`.
    - `1e. Unmanaged transaction rollback`: `AssertionError: expected AuditLogs to be null`.
- **Database Inspection**:
  - Inspected storage engine via `information_schema.TABLES`:
    ```json
    AUDIT LOGS TABLE ENGINE: [
      {
        "TABLE_NAME": "audit_logs",
        "ENGINE": "MyISAM"
      }
    ]
    ```
  - Inspected `migration.sql` line 156-170:
    ```sql
    CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID NOT NULL PRIMARY KEY,
        ...
        CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    ```
    Note: `ENGINE=InnoDB` is absent from table definition.
- **Second Execution Output (with `ENGINE=InnoDB` explicitly set on `audit_logs`)**:
  - Command: `export PATH=/home/hkayrad/.nvm/versions/node/v24.18.0/bin:$PATH && npm test --workspace=server AuditLogChallengerM3.test.ts`
  - Output: `Test Files 1 passed (1) | Tests 11 passed (11)` across 14.23s.

## 2. Logic Chain
1. Code-level analysis of `AuditLogService.ts` (line 25) and `AuditLogRepository.ts` (line 7) confirms that `transaction?: Transaction` is properly passed from `AuditLogService.recordAction` to `AuditLogRepository.createLog` to `AuditLogs.create(data, { transaction })`.
2. When `audit_logs` table is created without specifying `ENGINE=InnoDB` (as in `migration.sql` line 156), MySQL/MariaDB instances default to `MyISAM` if configured as default engine.
3. MyISAM storage engine does NOT support transactions or foreign key constraints. Transactions (`START TRANSACTION`, `COMMIT`, `ROLLBACK`) execute without throwing errors, but writes to MyISAM tables are immediately autocommitted and cannot be rolled back.
4. When `AuditLogService.recordAction(dto, transaction)` is executed inside a transaction that is rolled back (`transaction.rollback()` or managed transaction throwing an exception), the audit log record remains permanently in the database if `audit_logs` is MyISAM.
5. When `audit_logs` is created/altered as `ENGINE=InnoDB`, transaction rollbacks work perfectly, completely removing audit logs created within aborted transactions.
6. Multi-tenant stress testing under 90 concurrent operations across 5 distinct companies proved that `AuditLogService.getLogs` enforces strict `company_id` matching, preventing cross-tenant data leakage or filter override attacks.

## 3. Caveats
- MariaDB servers configured with `default_storage_engine = InnoDB` will automatically create `audit_logs` as InnoDB even without `ENGINE=InnoDB` in DDL. However, production or test environments defaulting to MyISAM will fail transaction rollbacks unless `ENGINE=InnoDB` is explicit in `migration.sql`.

## 4. Conclusion
- Code implementation in `AuditLogService` and `AuditLogRepository` correctly supports transaction propagation and multi-tenant isolation.
- **Action Required**: Modify `migration.sql` line 170 to explicitly append `ENGINE=InnoDB` to the `CREATE TABLE IF NOT EXISTS audit_logs` statement to guarantee transaction atomicity and foreign key constraint enforcement across all MariaDB/MySQL environments.

## 5. Verification Method
To independently verify:
1. Run the challenger test suite:
   ```bash
   export PATH=/home/hkayrad/.nvm/versions/node/v24.18.0/bin:$PATH
   npm test --workspace=server AuditLogChallengerM3.test.ts
   ```
2. Confirm 100% pass rate (11/11 tests pass) when `ENGINE=InnoDB` is set on `audit_logs`.
3. Inspect `migration.sql` line 156-170 to verify table creation DDL.
