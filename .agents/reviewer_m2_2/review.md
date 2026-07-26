# Review Report — Milestone 2: DB Schema & Common Types

## Review Summary

**Verdict**: REQUEST_CHANGES (FAIL)

The implementation of Milestone 2 (DB Schema & Common Types) passes build compilation and basic unit tests, but contains a **Critical Schema FK Defect** in `migration.sql` that causes database foreign key constraint conflicts, along with **Major Multitenancy Indexing Gaps**.

---

## Findings

### [Critical] Finding 1: Foreign Key Contradiction on `company_id` in `migration.sql`

- **What**: `company_id` column is defined as `NOT NULL`, but its foreign key constraint is configured with `ON DELETE SET NULL`.
- **Where**: `/home/hkayrad/Repos/comma/migration.sql`, lines 158 and 168:
  ```sql
  company_id UUID NOT NULL,
  ...
  CONSTRAINT fk_audit_logs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
  ```
- **Why this is a problem**: 
  1. **Schema Contradiction**: Setting `ON DELETE SET NULL` on a `NOT NULL` column is an invalid relational constraint. Attempting to delete a record from `companies` will trigger InnoDB/MySQL runtime error `1364` or `1452` ("Column 'company_id' cannot be null"), failing the company deletion query or causing unpredictable behavior.
  2. **Multitenancy Violation**: In this architecture, all other company-scoped financial tables (`users`, `receivable_customers`, `payable_customers`, `receivable_debts`, `payable_debts`, `receivable_payments`, `payable_payments`) enforce `ON DELETE CASCADE` on `company_id` (see `migration.sql` lines 107-143). Audit log tenant scoping requires `company_id` to remain bound to the target tenant or cascaded upon tenant removal.
- **Suggestion**: Update `migration.sql` line 168 to use `ON DELETE CASCADE`:
  ```sql
  CONSTRAINT fk_audit_logs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  ```

---

### [Major] Finding 2: Missing DDL Indexes in `migration.sql` & Suboptimal Multitenant Indexing in `AuditLogs.ts`

- **What**: 
  1. `migration.sql` does NOT contain any `CREATE INDEX` or inline index definitions for `audit_logs` (only PRIMARY KEY `id` is indexed).
  2. `AuditLogs.ts` defines compound index `idx_audit_logs_entity` as `["entity_type", "entity_id"]` and `idx_audit_logs_created_at` as `["created_at"]`, omitting `company_id` from the leading index positions.
- **Where**:
  - `/home/hkayrad/Repos/comma/migration.sql` lines 156-170
  - `/home/hkayrad/Repos/comma/server/src/models/AuditLogs.ts` lines 90-107
- **Why this is a problem**:
  1. **Raw SQL Deployment Defect**: Deploying DB schema via `migration.sql` results in an unindexed `audit_logs` table (except PK and implicit FK single-column indexes).
  2. **Multitenant Query Performance**: Every query in the audit log service (`AuditLogService.getLogs`) is scoped by tenant (`WHERE company_id = ?`). Filtering by entity (`WHERE company_id = ? AND entity_type = ? AND entity_id = ?`) or sorting by creation date (`WHERE company_id = ? ORDER BY created_at DESC`) without `company_id` as the primary index column forces MySQL to perform full index scans or unindexed filesorts across all tenants' audit records.
- **Suggestion**:
  1. Add index DDLs to `migration.sql` or table creation script.
  2. Update compound indexes in `AuditLogs.ts` (and `migration.sql`) to include `company_id`:
     - `idx_audit_logs_company_entity`: `["company_id", "entity_type", "entity_id"]`
     - `idx_audit_logs_company_created_at`: `["company_id", "created_at"]`

---

### [Minor] Finding 3: Runtime Serialization Clarity for JSON & Date Fields

- **What**: `old_values` and `new_values` are defined as `DataTypes.JSON` (`Record<string, any> | null`).
- **Where**: `/home/hkayrad/Repos/comma/server/src/models/AuditLogs.ts` lines 58-67
- **Why this is a problem**: While TypeScript definitions and Sequelize JSON types are correct, runtime hooks must ensure objects passed to `old_values`/`new_values` handle `Date` serialization and cyclic reference avoidance cleanly.
- **Suggestion**: Ensure Service layer (`AuditLogService`) standardizes diff sanitization prior to model insertion in Milestone 3.

---

## Verified Claims

- **Command `npm run build`** → verified via `run_command` → **PASS** (built common and server targets without error).
- **Command `npm run typecheck --workspace=server`** → verified via `run_command` → **PASS** (0 TypeScript errors).
- **Command `npx vitest run src/tests/models/AuditLogs.test.ts`** → verified via `run_command` → **PASS** (2/2 model unit tests passed).
- **Common Types Export (`@comma/common/types`)** → verified via `view_file` → **PASS** (`AuditLogAction`, `AuditLogDto`, `AuditLogCreateDto` exported in `common/src/audit_logs/types.ts` & `common/src/types.ts`).
- **Sequelize Model Export (`server/src/models/index.ts`)** → verified via `view_file` → **PASS** (`export * from "./AuditLogs"` included).
- **FK Constraint Integrity (`migration.sql`)** → verified via `view_file` → **FAIL** (`company_id NOT NULL` with `ON DELETE SET NULL` is invalid).

---

## Coverage Gaps & Attack Surface Analysis

- **Unexplored Area**: Live DB execution of `migration.sql` on a running MySQL/MariaDB database instance under `FOREIGN_KEY_CHECKS=1` when deleting a company.
- **Risk Level**: **HIGH**.
- **Recommendation**: Update `migration.sql` to fix foreign key constraint before proceeding to Milestone 3 implementation.

---

## Unverified Items

- Live MariaDB DDL execution (verified via static DDL analysis & code inspection).
