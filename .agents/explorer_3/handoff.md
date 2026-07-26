# Handoff Report: Sequelize Hooks, Authentication Context & Admin Controllers Analysis

## 1. Observation
- **Sequelize Hook Usage**:
  - Investigated `server/src/models/` and `server/src/`. Found **0** occurrences of Sequelize hooks (`afterCreate`, `afterUpdate`, `afterDestroy`, `afterRestore`, `beforeCreate`, `beforeUpdate`, `beforeDestroy`, `beforeRestore`, `addHook`).
  - Target financial models (`ReceivableDebts`, `PayableDebts`, `ReceivablePayments`, `PayablePayments`, `ReceivableCustomers`, `PayableCustomers`, `Users`, `Companies`) extend `Model` and use `Model.init(...)` with options `createdAt: "created_at"`, `updatedAt: "updated_at"`, `deletedAt: "deleted_at"`, `paranoid: true`.
- **Authentication & Request Context**:
  - `authMiddleware` in `server/src/lib/middleware.ts:7-31` verifies JWT from `req.cookies.access_token` and populates `req.user` (`AuthenticatedUser` interface in `server/src/index.ts:35-40`: `id`, `companyId`, `username`, `role`).
  - `adminMiddleware` in `server/src/lib/middleware.ts:33-46` wraps `authMiddleware` and checks `req.user.role === UserRole.ADMIN`.
  - Request IP (`req.ip` / `req.headers['x-forwarded-for']`) and User Agent (`req.headers['user-agent']`) are accessible via Express request object.
  - `AsyncLocalStorage` is currently **not used** in the project (`grep_search` returned 0 matches for `AsyncLocalStorage`).
- **Admin Controller Conventions**:
  - Located in `server/src/controllers/Admin/` (`CompanyManagementController.ts`, `UserManagementController.ts`).
  - Protected with `router.use(adminMiddleware)`.
  - Input validation: `validate(schema, "body" | "query")` using Zod schemas from `@comma/common/schemas`.
  - Pagination handled via `validate(paginationSchema, "query")` (`page` default 0, `limit` default 20, `sorting`, `filters`).
  - Responses wrapped in `{ success: true, data: ..., message?: string }`.
- **Test Conventions**:
  - Vitest + Supertest setup in `server/src/tests/` configured in `server/vitest.config.ts` and `server/src/tests/setup.ts`.
  - Spies on service layer (`vi.spyOn(Service, 'Method').mockResolvedValue(...)`) and tests auth via cookie containing signed admin JWT.

## 2. Logic Chain
1. **Model Mutation Audit Trail**:
   - Financial models use `paranoid: true` soft deletes.
   - Sequelize v6.37.8 provides `afterCreate`, `afterUpdate`, `afterDestroy`, and `afterRestore` lifecycle hooks.
   - For `afterUpdate`, calling `instance.changed()` identifies changed attributes, and `instance.previous()` retrieves pre-mutation values to populate `old_values` and `new_values` for `AuditLogDto`.
   - Soft deletes (`destroy`) trigger `afterDestroy`; restore actions (`restore`) trigger `afterRestore`.
2. **Context Delivery to Hooks**:
   - Because `AsyncLocalStorage` is not currently used, context (`user_id`, `company_id`, `ip_address`, `user_agent`) can either be passed explicitly in Sequelize options (`Model.create(data, { user_id, ip_address, ... })`) or captured via an Express `AsyncLocalStorage` request middleware.
3. **Controller Architecture Alignment**:
   - Creating `AuditLogController.ts` in `server/src/controllers/Admin/` for `GET /admin/audit-logs` must follow existing admin controller conventions: `adminMiddleware`, `validate(paginationSchema, "query")`, `asyncHandler`, and standardized JSON response wrapper `{ success: true, data: { rows, count } }`.

## 3. Caveats
- No custom hooks middleware or AsyncLocalStorage store currently exists; implementers will need to decide whether to introduce AsyncLocalStorage middleware or pass context via Sequelize options parameter.
- Bulk operations (`bulkCreate`, `update({ where })`, `destroy({ where })`, `restore({ where })`) do not trigger single instance hooks by default unless `individualHooks: true` is passed or bulk hooks are explicitly handled.

## 4. Conclusion
- The target financial models are properly configured with Sequelize `paranoid: true` and timestamp mappings, making them ready for `afterCreate`, `afterUpdate`, `afterDestroy`, and `afterRestore` hook attachments.
- Auth context (`user_id`, `company_id`, `ip_address`, `user_agent`) is available on incoming HTTP requests via `req.user`, `req.ip`, and `req.headers['user-agent']`.
- Admin controllers in `server/src/controllers/Admin/` follow a uniform pattern (`adminMiddleware`, `validate`, `asyncHandler`, standard JSON format) which `AuditLogController.ts` should follow.

## 5. Verification Method
- Code inspection of `server/src/models/`, `server/src/lib/middleware.ts`, `server/src/controllers/Admin/`, and `server/vitest.config.ts`.
- Full detailed analysis documented in `/home/hkayrad/Repos/comma/.agents/explorer_3/analysis.md`.
