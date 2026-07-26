## 2026-07-25T09:13:25Z
Your archetype is teamwork_preview_worker.
Working directory: /home/hkayrad/Repos/comma/.agents/implementer_m2_fix
Scope document: /home/hkayrad/Repos/comma/.agents/orchestrator/plan.md

Objective:
Remediate Milestone 2 schema and model files according to Reviewer and Challenger findings.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Remediation Tasks:
1. `migration.sql`:
   - Change foreign key constraint `fk_audit_logs_company` for `company_id` from `ON DELETE SET NULL` to `ON DELETE CASCADE`:
     `CONSTRAINT fk_audit_logs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,`
   - Add explicit DDL index creation statements in `migration.sql`:
     - `CREATE INDEX idx_audit_logs_company_entity ON audit_logs (company_id, entity_type, entity_id);`
     - `CREATE INDEX idx_audit_logs_company_created_at ON audit_logs (company_id, created_at);`

2. `server/src/models/AuditLogs.ts`:
   - Update model compound index definitions in `AuditLogs.ts` so `company_id` is the leading column in compound indexes:
     - `idx_audit_logs_company_entity`: `fields: ['company_id', 'entity_type', 'entity_id']`
     - `idx_audit_logs_company_created_at`: `fields: ['company_id', 'created_at']`
   - Add model validation for `action`: `validate: { isIn: [['CREATE', 'UPDATE', 'DELETE', 'RESTORE']] }`

3. Verification:
   - Run `npm run build:common` and `npm run build:server` and `npm run typecheck --workspace=server`.
   - Run `npx vitest run src/tests/models/` to ensure all model tests pass.
   - Document changes in `/home/hkayrad/Repos/comma/.agents/implementer_m2_fix/changes.md` and handoff in `/home/hkayrad/Repos/comma/.agents/implementer_m2_fix/handoff.md`.
   - Send message to parent (orchestrator) upon completion.
