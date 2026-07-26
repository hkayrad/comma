## 2026-07-25T09:23:42Z
You are worker implementer_m4 for Milestone 4 (Sequelize Mutation Hooks Integration).

Working Directory: /home/hkayrad/Repos/comma/.agents/implementer_m4

Objectives:
1. Minor schema fix: Check migration.sql (search for `CREATE TABLE audit_logs` in the repository). Append `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;` to the `audit_logs` DDL statement if it's not present.
2. Implement Sequelize mutation hooks (`afterCreate`, `afterUpdate`, `afterDestroy`, `afterRestore`) on all 8 target financial models:
   - ReceivableDebts
   - PayableDebts
   - ReceivablePayments
   - PayablePayments
   - ReceivableCustomers
   - PayableCustomers
   - Users
   - Companies
3. Hooks requirements:
   - Hooks must call `AuditLogService.recordAction` (or `AuditLogRepository`) to log mutations.
   - Capture `action`: 'CREATE', 'UPDATE', 'DELETE' (for soft-deletes via destroy), 'RESTORE' (via restore).
   - Capture `entity_type` (model name), `entity_id` (instance primary key), `company_id` (instance.company_id or instance.id for Companies), `user_id` (from options/context e.g. options.user_id, options.userId, or options.context), `ip_address`, `user_agent`.
   - For `UPDATE`, construct `old_values` (previous values of changed fields) and `new_values` (new values of changed fields).
   - For `CREATE`, construct `new_values`.
   - For `DELETE`, construct `old_values`.
   - For `RESTORE`, construct `new_values`.
   - Pass `options.transaction` to `AuditLogService.recordAction` so audit log creation stays inside the same database transaction.
4. Add comprehensive unit/integration test coverage for hooks across the target models.
5. Execute the build and test commands (e.g. vitest / npm test) to ensure 100% passing tests across the monorepo.
6. Write a handoff report at `/home/hkayrad/Repos/comma/.agents/implementer_m4/handoff.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, send a message to parent orchestrator with your results and handoff path.
