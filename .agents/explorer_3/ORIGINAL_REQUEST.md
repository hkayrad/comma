## 2026-07-25T09:04:03Z

Your archetype is teamwork_preview_explorer.
Working directory: /home/hkayrad/Repos/comma/.agents/explorer_3
Scope document: /home/hkayrad/Repos/comma/.agents/orchestrator/plan.md

Objective:
Investigate Sequelize model hook capabilities/patterns in the project, authentication/company context extraction (e.g. middleware, AsyncLocalStorage, req context), and Admin controllers in `server/src/controllers/Admin/`.

Instructions:
1. Check if Sequelize lifecycle hooks (`afterCreate`, `afterUpdate`, `afterDestroy`, `afterRestore` or hooks middleware) are already used in `server/src/models/` or elsewhere.
2. Check how user ID, company ID, IP address, user agent context are passed or accessed in requests and database operations.
3. Analyze `server/src/controllers/Admin/` controller conventions, route protection/auth middleware, pagination query handling, and test conventions in `server/src/tests/`.
4. Write your full analysis report to `/home/hkayrad/Repos/comma/.agents/explorer_3/analysis.md` and deliver a handoff report in `/home/hkayrad/Repos/comma/.agents/explorer_3/handoff.md`.
5. Send a message to your parent (orchestrator) with your findings summary and file paths.
