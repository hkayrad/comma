# Project Update: Zod Schema Migration & Security Hardening

This document summarizes the changes implemented during the orchestration session on 2026-04-22, focusing on the findings from `CodeReviewReport.md` and database synchronization with `v2_migration.sql`.

## 1. Package Restructuring (`@comma/common`)
The `@common` package was restructured from a flat file system into domain-based modules to improve maintainability and scalability.

- **New Structure**:
  - `common/src/auth/`: Schemas and types for authentication.
  - `common/src/customers/`: Schemas and types for payable/receivable customers.
  - `common/src/debts/`: Schemas and types for debt management.
  - `common/src/payments/`: Schemas and types for payment transactions.
  - `common/src/companies/`: Schemas and types for company profiles.
  - `common/src/config/`: Schemas and types for system configuration.
  - `common/src/shared/`: Shared base types (e.g., UUID, AvailableCurrency).
- **Centralized Constants**:
  - Created `common/src/constants.ts` to host system-wide constants.
  - `ADMIN_ROLE_ID`: Standardized as `99`.
  - `ADMIN_USER_ID` & `ADMIN_COMPANY_ID`: Standardized as the system-level zero UUID (`00000000-0000-0000-0000-000000000000`).
- **Backward Compatibility**: Maintained re-exports in `common/src/schemas.ts` and `common/src/types.ts` to avoid breaking existing imports.

## 2. Security Hardening
Critical security findings were addressed across the server:

- **Secure Logging**: Modified `server/index.ts` to mask sensitive environment variables (like `DB_URL` containing credentials) in startup console logs.
- **Admin Role Centralization**: Replaced hardcoded `99` values with the `UserRole.ADMIN` enum across all controllers, middleware, and the test suite.
- **Rate Limiting**: Applied `authRateLimiter` middleware to all sensitive write operations (POST, PUT, DELETE) in `UserManagementController.ts`.

## 3. Database & Validation Synchronization
Synchronized the application layer with the `v2_migration.sql` database constraints.

- **Zod Schemas**: Updated string lengths (e.g., Phone: 20, Mersis: 16, Tax Number: 11, Address: 255) to match the database's `VARCHAR` limits.
- **Sequelize Models**: 
  - Updated all models in `server/models/` to match database field lengths.
  - Added explicit index definitions (`idx_company_id`, `idx_customer_id`, etc.) to the model initializers.
  - Updated class declarations with `CreationOptional` to resolve TypeScript build errors for auto-generated fields.

## 4. Frontend Integration & Alias Resolution
Cleaned up redundant validation logic and resolved build issues.

- **Schema Composition**: Refactored client Dialog components (`DebtDialog`, `PaymentDialog`, `CustomerDialog`, etc.) to extend the centralized `@common` schemas rather than re-defining them inline.
- **Alias Fixes**: 
  - Updated `client/vite.config.ts` to correctly resolve the `@common` alias.
  - Updated `client/tsconfig.app.json` for path mapping and disabled `erasableSyntaxOnly` to support Enum usage in the client.
- **TS Compliance**: Batch refactored `common` types to use `import type` to comply with the `verbatimModuleSyntax` rule required by the client build.

## 5. Maintenance Tools
- Created `cleanup_test_data.sql` to permanently remove test company data (`TO_DELETE_REPO`) from the database.

---
**Status**: Both Client and Server packages build successfully. All tests have been updated to use centralized constants.

## Remaining Tasks (from CodeReviewReport.md)
The following items from the initial report were deferred or identified as out-of-scope for the current orchestration and should be addressed in future sessions:

### 1. Performance & Frontend Optimization
- **Inefficient Debt Status Subquery (COMPLETED)**: Refactored `DebtRepository.ts` to use `LEFT JOIN` on optimized database views instead of inline subqueries.
  - Created `vw_receivable_payment_by_invoice` and `vw_payable_payment_by_invoice` views.
  - Standardized `migration.sql` to include all required application views.
  - Improved `is_paid` status calculation using explicit TRY-base arithmetic and customer-safe joining.
- **Context Re-render Bottleneck (COMPLETED)**: Refactored the frontend `UserProvider` to use **Zustand** with selectors, preventing full-tree re-renders on state changes.
  - Replaced React Context with a global Zustand store in `useUser.tsx`.
  - Updated all consuming components (`Login`, `AuthCheck`, `Sidebar`, etc.) to use fine-grained selectors.
  - Retained `UserProvider` for lifecycle management (initial refresh) to maintain structural consistency.

### 2. Architecture & Consistency
- **Server Path Aliases**: Configure `@/` path alias support in the server's `tsconfig.json` to match the frontend's convention.
- **Import Standardization**: Continue refactoring deep relative imports (`../../../`) to use the `@common/` workspace alias across the monorepo.

### 3. Code Quality & Documentation
- **Migration Views**: Ensure all required database views (e.g., `vw_receivable_total_debt_by_company`) are formally documented in the migration scripts.
- **Documentation Cleanup**: Update `CODING_CONVENTIONS.md` to remove outdated Zod implementation TODOs that have since been completed.
- **Global Error Mapping**: Implement a centralized utility to map backend error codes to frontend `i18next` translation keys for more consistent user feedback.
