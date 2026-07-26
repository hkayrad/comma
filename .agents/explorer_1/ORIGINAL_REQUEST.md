## 2026-07-25T09:04:03Z
Your archetype is teamwork_preview_explorer.
Working directory: /home/hkayrad/Repos/comma/.agents/explorer_1
Scope document: /home/hkayrad/Repos/comma/.agents/orchestrator/plan.md

Objective:
Investigate codebase structure, DB migration files (`migration.sql`), build/test scripts in `package.json`, test runner setup, and check how the financial models (`ReceivableDebts`, `PayableDebts`, `ReceivablePayments`, `PayablePayments`, `ReceivableCustomers`, `PayableCustomers`, `Users`, `Companies`) are defined in `server/src/models/`.

Instructions:
1. Examine project root `package.json`, `migration.sql` or DB migration directory, build and test configurations.
2. Locate the existing model definitions and their table names/foreign keys.
3. Determine how existing tests run (command, framework, coverage, test runner setup).
4. Write your full analysis report to `/home/hkayrad/Repos/comma/.agents/explorer_1/analysis.md` and deliver a handoff report in `/home/hkayrad/Repos/comma/.agents/explorer_1/handoff.md`.
5. Send a message to your parent (orchestrator) with your findings summary and file paths.
