# Handoff Report: Codebase & Financial Models Exploration

**Agent**: `teamwork_preview_explorer` (`explorer_1`)
**Handoff Type**: Hard (Task Complete)
**Target Location**: `/home/hkayrad/Repos/comma/.agents/explorer_1/handoff.md`

---

## 1. Observation

- **Root Monorepo**: `package.json` line 5 defines workspaces `["common", "client", "server"]`.
- **Server Package Scripts**: `server/package.json` line 11 defines `"test": "vitest run"`, line 13 `"test:coverage": "vitest run --coverage"`.
- **Vitest Setup**: `server/vitest.config.ts` configures `globals: true`, `environment: 'node'`, setup files `['./src/tests/dotenv-setup.ts', './src/tests/setup.ts']`, `include: ['src/**/*.test.ts']`.
- **Test Database Hook**: `server/src/tests/setup.ts` lines 9-22 authenticates via `sequelize.authenticate()` using `.env.test`.
- **Migration SQL**: `/home/hkayrad/Repos/comma/migration.sql` defines foreign keys and schema modifications converting PK/FK columns (`company_id`, `customer_id`, `created_by`, `deleted_by`) to `UUID NOT NULL`.
- **Financial Models (`server/src/models/`)**:
  - `Companies.ts`: line 97 `modelName: "Companies"`, line 98 `tableName: "companies"`, line 102 `paranoid: true`.
  - `Users.ts`: line 117 `modelName: "Users"`, line 118 `tableName: "users"`, FKs: `company_id`, `created_by`, `deleted_by`, line 122 `paranoid: true`.
  - `ReceivableCustomers.ts`: line 119 `modelName: "ReceivableCustomers"`, line 120 `tableName: "receivable_customers"`, FKs: `company_id`, `created_by`, `deleted_by`, line 124 `paranoid: true`.
  - `PayableCustomers.ts`: line 116 `modelName: "PayableCustomers"`, line 117 `tableName: "payable_customers"`, FKs: `company_id`, `created_by`, `deleted_by`, line 121 `paranoid: true`.
  - `ReceivableDebts.ts`: line 156 `modelName: "ReceivableDebts"`, line 157 `tableName: "receivable_debts"`, FKs: `company_id`, `customer_id` -> `ReceivableCustomers`, `created_by`, `deleted_by`, line 161 `paranoid: true`. Virtuals: `total` (lines 89-98), `total_in_try` (lines 99-105).
  - `PayableDebts.ts`: line 156 `modelName: "PayableDebts"`, line 157 `tableName: "payable_debts"`, FKs: `company_id`, `customer_id` -> `PayableCustomers`, `created_by`, `deleted_by`, line 161 `paranoid: true`. Virtuals: `total` (lines 89-98), `total_in_try` (lines 99-105).
  - `ReceivablePayments.ts`: line 137 `modelName: "ReceivablePayments"`, line 138 `tableName: "receivable_payments"`, FKs: `company_id`, `customer_id` -> `ReceivableCustomers`, `created_by`, `deleted_by`, line 142 `paranoid: true`. Virtual: `amount_in_try` (lines 71-77).
  - `PayablePayments.ts`: line 134 `modelName: "PayablePayments"`, line 135 `tableName: "payable_payments"`, FKs: `company_id`, `customer_id` -> `PayableCustomers`, `created_by`, `deleted_by`, line 139 `paranoid: true`. Virtual: `amount_in_try` (lines 68-74).

---

## 2. Logic Chain

1. **Monorepo setup verification**: Inspecting `package.json` confirms workspace separation where shared types live in `@comma/common` (`common/src/types.ts`) and backend logic in `@comma/server`.
2. **Test setup verification**: Inspecting `server/vitest.config.ts`, `server/src/tests/setup.ts`, and `server/src/tests/dotenv-setup.ts` shows Vitest runs test suites against MariaDB with `.env.test`.
3. **Database schema verification**: Inspecting `migration.sql` confirms UUID usage across primary and foreign key columns for companies, users, receivable/payable customers, debts, and payments.
4. **Model mapping verification**: Inspecting `server/src/models/*.ts` confirms all 8 target models are defined with Sequelize TypeScript decorators/class extensions, using `paranoid: true` for soft-deletes (`deleted_at`).
5. **Mutation hook requirements**: Because all target models use `paranoid: true`, audit log mutation hooks (Milestone 4) must support `afterCreate`, `afterUpdate`, `afterDestroy` (soft delete), and `afterRestore` (restoration).

---

## 3. Caveats

- **Test Execution**: Live test execution (`npm test`) timed out waiting for shell execution permissions; however, test configurations (`vitest.config.ts`, `setup.ts`, `server/package.json`) and existing 46 test files were fully inspected.
- **Assumptions**: Assumed development database environment matches `.env.test` configuration as documented in `server/src/tests/setup.ts`.

---

## 4. Conclusion

Exploration of Milestone 1 scope is complete. All 8 financial models (`Companies`, `Users`, `ReceivableCustomers`, `PayableCustomers`, `ReceivableDebts`, `PayableDebts`, `ReceivablePayments`, `PayablePayments`) are fully cataloged with exact table names, PKs, FKs, virtual fields, and paranoid soft-delete settings. Full analysis is available in `/home/hkayrad/Repos/comma/.agents/explorer_1/analysis.md`.

---

## 5. Verification Method

1. Inspect `/home/hkayrad/Repos/comma/.agents/explorer_1/analysis.md` for full detailed tables and code mappings.
2. Inspect `server/vitest.config.ts` and `server/src/models/index.ts` to confirm model exports and test setup.
3. Run `npm run build --workspace=common` followed by `npm --prefix server test` when execution environment permissions are active.
