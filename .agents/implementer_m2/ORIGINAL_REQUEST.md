## 2026-07-25T09:06:17Z

<USER_REQUEST>
Your archetype is teamwork_preview_worker.
Working directory: /home/hkayrad/Repos/comma/.agents/implementer_m2
Scope document: /home/hkayrad/Repos/comma/.agents/orchestrator/plan.md

Objective:
Implement Milestone 2: DB Schema & Common Types.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Detailed Tasks:
1. Database Schema (`audit_logs` table in `migration.sql`):
   - Add table `audit_logs` to `migration.sql`:
     - `id`: `UUID NOT NULL PRIMARY KEY`
     - `company_id`: `UUID NOT NULL`
     - `user_id`: `UUID NULL`
     - `entity_type`: `VARCHAR(50) NOT NULL` (e.g. `receivable_debts`, `payable_payments`, `customers`, etc.)
     - `entity_id`: `UUID NOT NULL`
     - `action`: `VARCHAR(20) NOT NULL` (`CREATE`, `UPDATE`, `DELETE`, `RESTORE`)
     - `old_values`: `JSON NULL`
     - `new_values`: `JSON NULL`
     - `ip_address`: `VARCHAR(45) NULL`
     - `user_agent`: `TEXT NULL`
     - `created_at`: `DATETIME DEFAULT CURRENT_TIMESTAMP`
     - Foreign keys to `companies(id)` and `users(id)` with `ON DELETE SET NULL`.

2. Shared Types (`@comma/common`):
   - In `common/src/types.ts` (and export from `common/src/index.ts`):
     - `AuditLogAction`: `'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'`
     - `AuditLogDto`: interface with fields matching table schema
     - `AuditLogCreateDto`: type omitting `id` and `created_at`

3. Sequelize Model (`AuditLogs.ts`):
   - In `server/src/models/AuditLogs.ts`:
     - Define `AuditLogs` model extending `Model`
     - Field mappings for `id`, `company_id`, `user_id`, `entity_type`, `entity_id`, `action`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`
     - Association definitions to `Companies` and `Users`
     - Export model and register in `server/src/models/index.ts`

4. Build & Verification:
   - Run build commands (`npm run build` or `npm run typecheck`).
   - Document commands executed, build outputs, and test status in your report `/home/hkayrad/Repos/comma/.agents/implementer_m2/changes.md` and handoff `/home/hkayrad/Repos/comma/.agents/implementer_m2/handoff.md`.
   - Send message to parent (orchestrator) with results.
</USER_REQUEST>
