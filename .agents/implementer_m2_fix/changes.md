# Milestone 2 Remediation Changes

## Summary of Changes

### 1. Database Schema (`migration.sql`)
- **Foreign Key Constraint Remediation**: Updated `CONSTRAINT fk_audit_logs_company` on `company_id` from `ON DELETE SET NULL` to `ON DELETE CASCADE`. This aligns with `company_id` being defined as `NOT NULL` in the table definition.
- **DDL Index Statements**: Added explicit index creation statements:
  ```sql
  CREATE INDEX idx_audit_logs_company_entity ON audit_logs (company_id, entity_type, entity_id);
  CREATE INDEX idx_audit_logs_company_created_at ON audit_logs (company_id, created_at);
  ```

### 2. Model Definition (`server/src/models/AuditLogs.ts`)
- **Model-Level Enum Validation**: Added `validate: { isIn: [["CREATE", "UPDATE", "DELETE", "RESTORE"]] }` to the `action` attribute definition.
- **Compound Index Definitions**: Replaced legacy compound indexes with `company_id` as leading column:
  - `idx_audit_logs_company_entity`: `fields: ["company_id", "entity_type", "entity_id"]`
  - `idx_audit_logs_company_created_at`: `fields: ["company_id", "created_at"]`

### 3. Test Suite Update (`server/src/tests/models/AuditLogsChallenger.test.ts`)
- **Action Validation Test**: Updated the test case to assert that calling `.validate()` on an `AuditLogs` instance with an invalid action (e.g. `"INVALID_ACTION_NAME"`) fails validation with a `SequelizeValidationError`.

## Verification Results
- `npm run build:common`: Passed cleanly.
- `npm run build:server`: Passed cleanly.
- `npm run typecheck --workspace=server`: Passed cleanly.
- `npx vitest run src/tests/models/`: Passed 3/3 test files (19/19 tests).
