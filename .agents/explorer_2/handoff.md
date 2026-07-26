# Handoff Report: `@comma/common` Package, Repository & Service Layer Exploration

## 1. Observation
- **`@comma/common` Workspace & Exports**:
  - `common/package.json`: package name `"@comma/common"`, main `"./dist/index.js"`, types `"./dist/index.d.ts"`.
  - `common/src/index.ts`: exports `openapi`, `types`, `schemas`, `enums`, `constants`.
  - `common/src/types.ts`: re-exports all subfolder types (`auth`, `customers`, `debts`, `payments`, `companies`, `config`, `shared`, `portal`).
  - `common/src/schemas.ts`: re-exports all subfolder Zod schemas (`paginationSchema` in `common/src/shared/schemas.ts`).
  - `server/tsconfig.json`: maps `@comma/common` to `../common/src/index` and `@comma/common/*` to `../common/src/*`.
- **Repositories (`server/src/repositories/`)**:
  - Found 6 repository files: `CompanyRepository.ts`, `UserRepository.ts`, `ConfigRepository.ts`, `CustomerRepository.ts`, `DebtRepository.ts`, `PaymentRepository.ts`.
  - Static repositories (`CompanyRepository`, `UserRepository`, `ConfigRepository`) use static async methods.
  - Domain-parameterized repositories (`CustomerRepository`, `DebtRepository`, `PaymentRepository`) instantiate class instances with domain (`"receivable" | "payable"`).
  - Every mutation and query method accepts `transaction?: Transaction`.
  - `findAllWithPagination` / `findAllWithSummary` accept `limit`, `offset`, `sorting: SortItem[]`, `filters: FilterItem[]` and return `{ rows: T[]; count: number }`.
- **Services (`server/src/services/`)**:
  - Found 20 service files across `Admin/`, `Generic/`, `Payable/`, `Receivable/`, `AuthService.ts`, `ConfigService.ts`, etc.
  - Service methods are `static async` taking DTOs, `userId: UUID`, `companyId: UUID`.
  - Service methods use `sequelize.transaction(async (t) => ...)` for atomic operations and pass `t` to repositories.
  - Error handling uses `AppError` subclasses (`ValidationError`, `NotFoundError`) from `@/lib/errors/AppError`.

## 2. Logic Chain
1. **Observation**: `server/tsconfig.json` routes `@comma/common/*` to `common/src/*`, and `common/src/index.ts` re-exports `types` and `schemas`.
   - **Reasoning**: Adding new types to `@comma/common` requires placing them in `common/src/shared/types.ts` or `common/src/types.ts` and exporting them through `common/src/index.ts`. No new build step is required for TS path resolution during server dev/typecheck.
2. **Observation**: Repositories for single-domain entities (`CompanyRepository`, `UserRepository`) use static class methods and accept `transaction?: Transaction` on all methods.
   - **Reasoning**: `AuditLogRepository` represents a single-domain system entity and should follow the static utility class pattern of `CompanyRepository` / `UserRepository`.
3. **Observation**: Services handle offset calculation (`offset = page * limit`), error validation via `ValidationError` / `NotFoundError`, logging via `Logger`, and pass transactions to repositories.
   - **Reasoning**: `AuditLogService` should follow this exact paradigm: static methods, `ValidationError` for bad input, `NotFoundError` when logs/entities aren't found, and `{ rows, count }` return structure for paginated lists.

## 3. Caveats
- No caveats. Full codebase examination of `@comma/common`, `server/src/repositories/`, and `server/src/services/` was performed.

## 4. Conclusion
The architectural conventions for `@comma/common`, repositories, and services are fully documented and clear. `AuditLogRepository` and `AuditLogService` can be implemented following these exact patterns without architectural drift.

## 5. Verification Method
- **Inspect Files**:
  - `common/package.json`
  - `server/tsconfig.json`
  - `server/src/repositories/CompanyRepository.ts`
  - `server/src/repositories/UserRepository.ts`
  - `server/src/services/Admin/CompanyManagementService.ts`
  - `server/src/services/Admin/UserManagementService.ts`
- **Run Typecheck / Tests**:
  - In `server`: `npm run typecheck` or `npx vitest run`
