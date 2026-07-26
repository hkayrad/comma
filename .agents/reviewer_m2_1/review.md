# Milestone 2 Code Review Report

## Review Summary

**Verdict**: REQUEST_CHANGES

The implementation of Milestone 2 (DB Schema & Common Types) is mostly complete and high quality, with successful TypeScript builds, clean ORM model definitions, and passing unit tests. However, a major DDL constraint conflict in `migration.sql` requires correction before proceeding to downstream milestones.

---

## Findings

### [Major] Finding 1: Incompatible Foreign Key Constraint `ON DELETE SET NULL` on NOT NULL `company_id`

- **What**: In `migration.sql`, the `audit_logs` table defines `company_id` as `UUID NOT NULL`, but its foreign key constraint `fk_audit_logs_company` specifies `ON DELETE SET NULL`.
- **Where**: `/home/hkayrad/Repos/comma/migration.sql`, lines 158 and 168:
  ```sql
  158:     company_id UUID NOT NULL,
  ...
  168:     CONSTRAINT fk_audit_logs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  ```
- **Why**: In relational database management systems (MySQL / MariaDB / PostgreSQL), `ON DELETE SET NULL` cannot be applied to non-nullable columns (`NOT NULL`). If a referenced company row is deleted, the database engine will fail with a foreign key constraint violation because `company_id` cannot accept NULL values. Furthermore, all other multi-tenant tables in `migration.sql` (such as `users`, `receivable_customers`, `payable_debts`, `receivable_payments`) consistently specify `ON DELETE CASCADE` for `company_id`.
- **Suggestion**: Update line 168 of `migration.sql` to use `ON DELETE CASCADE`:
  ```sql
  CONSTRAINT fk_audit_logs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  ```

---

## Verified Claims

- **Shared Common Types & Exports**: Verified `common/src/audit_logs/types.ts`, `common/src/types.ts`, and `common/src/index.ts`. Types `AuditLogAction`, `AuditLogDto`, and `AuditLogCreateDto` strictly match the specifications in `plan.md`. -> **PASS**
- **Common Workspace Build**: Executed `npm run build:common` -> **PASS** (Exit Code 0).
- **Server Workspace Build**: Executed `npm run build:server` -> **PASS** (Exit Code 0).
- **Server Typecheck**: Executed `npm run typecheck --workspace=server` -> **PASS** (0 errors).
- **Vitest Unit Tests**: Executed `npm run test --workspace=server -- src/tests/models/AuditLogs.test.ts` -> **PASS** (2/2 tests passed).
- **Sequelize Model Definition**: Verified `server/src/models/AuditLogs.ts` and `server/src/models/index.ts`. `AuditLogs` model correctly maps fields (`id`, `company_id`, `user_id`, `entity_type`, `entity_id`, `action`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`), configures indexes (`company_id`, `user_id`, `entity_type + entity_id`, `created_at`), and defines associations (`belongsTo(Companies)`, `belongsTo(Users)`). -> **PASS**

---

## Coverage Gaps

- **Live Database Foreign Key Enforcement**: Vitest unit tests use in-memory Sequelize model instantiation rather than running `migration.sql` against a live MySQL instance. The `company_id` DDL flaw was identified via static SQL analysis.
- **Risk Level**: HIGH for migration execution in production/staging environments.
- **Recommendation**: Request implementer to fix line 168 in `migration.sql` to use `ON DELETE CASCADE`.

---

## Unverified Items

- None. All source files, build outputs, type checking, and test suites within scope were independently verified.
