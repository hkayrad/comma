# Comprehensive Architecture & Financial Models Analysis Report

**Date**: 2026-07-25
**Explorer**: `teamwork_preview_explorer` (explorer_1)
**Scope Document**: `/home/hkayrad/Repos/comma/.agents/orchestrator/plan.md`

---

## Executive Summary

This report provides a full architectural analysis of the Comma monorepo, covering project build/test infrastructure, database migration schemas (`migration.sql`), test runner setup, common types, and deep inspection of all eight target financial models in `server/src/models/` (`Companies`, `Users`, `ReceivableCustomers`, `PayableCustomers`, `ReceivableDebts`, `PayableDebts`, `ReceivablePayments`, `PayablePayments`).

---

## 1. Monorepo Project Structure

The project is structured as an `npm` workspace monorepo configured in root `package.json`:

```
/home/hkayrad/Repos/comma/
├── package.json          # Monorepo workspaces config (common, client, server)
├── migration.sql         # SQL schema migration script for MariaDB database
├── common/               # Shared types, zod schemas, openapi specs (@comma/common)
├── server/               # Backend Express REST API with Sequelize ORM (@comma/server)
└── client/               # Frontend React application
```

### Monorepo Workspaces & Package Overview

1. **`common` (`@comma/common`)**:
   - Entry point: `dist/index.js`, declaration file: `dist/index.d.ts`.
   - Build script: `tsc --build`.
   - Exports domain types (`auth`, `customers`, `debts`, `payments`, `companies`, `config`, `shared`, `portal`), Zod schemas, openapi spec generators, and constants.

2. **`server` (`@comma/server`)**:
   - Express 5 REST API using Sequelize ORM (`mariadb` dialect).
   - Build tool: `tsup` (outputs to `dist/`).
   - Typechecking: `tsc --noEmit`.
   - Test framework: Vitest (`vitest run`).

---

## 2. Build & Test Configurations

### Build Scripts (`package.json`)
- **Root `package.json`**:
  - `dev`: `node scripts/manage.js dev`
  - `build`: `npm run build --workspace=common && npm run build --workspace=client && npm run build --workspace=server`
  - Workspace-specific build scripts: `build:common`, `build:client`, `build:server`.
- **`server/package.json`**:
  - `dev`: `npx tsx --watch src/index.ts`
  - `build`: `tsup`
  - `typecheck`: `tsc --noEmit`
  - `test`: `vitest run`
  - `test:watch`: `vitest`
  - `test:coverage`: `vitest run --coverage`

### Test Runner Setup (`server/vitest.config.ts`)
- **Framework**: Vitest (`v4.1.4`).
- **Environment**: `node`.
- **Globals**: Enabled (`true`).
- **Test File Pattern**: `src/**/*.test.ts` (46 test files present in `server/src/tests/`).
- **Setup Hooks**:
  - `src/tests/dotenv-setup.ts`: Loads `.env.test` with fallback to `.env`.
  - `src/tests/setup.ts`: Connects to DB via `sequelize.authenticate()` in `beforeAll` and closes connection in `afterAll`.
  - Hook timeout set to `30000ms`.
- **Path Aliases**:
  - `@` -> `server/src`
  - `@comma/common` -> `common/src`
  - `@common` -> `common/src`
- **Coverage**: `v8` provider generating `text`, `json`, `html` reporters.

---

## 3. Database Migration Analysis (`migration.sql`)

The migration file `/home/hkayrad/Repos/comma/migration.sql` manages schema definitions and relationships for MariaDB:

1. **Foreign Key Cleanup**: Drops pre-existing foreign keys before column modification.
2. **UUID Column Conversion**: Modifies primary keys (`id`) and foreign keys (`company_id`, `customer_id`, `created_by`, `deleted_by`, `user_id`) to `UUID NOT NULL`.
3. **Foreign Keys Constraints**:
   - `users.company_id` -> `companies(id)` `ON DELETE CASCADE`
   - `users.created_by` / `deleted_by` -> `users(id)` `ON DELETE SET NULL`
   - `receivable_customers.company_id` -> `companies(id)` `ON DELETE CASCADE`
   - `receivable_customers.created_by` / `deleted_by` -> `users(id)` `ON DELETE SET NULL`
   - `payable_customers.company_id` -> `companies(id)` `ON DELETE CASCADE`
   - `payable_customers.created_by` / `deleted_by` -> `users(id)` `ON DELETE SET NULL`
   - `receivable_debts.company_id` -> `companies(id)` `ON DELETE CASCADE`, `customer_id` -> `receivable_customers(id)` `ON DELETE CASCADE`
   - `payable_debts.company_id` -> `companies(id)` `ON DELETE CASCADE`, `customer_id` -> `payable_customers(id)` `ON DELETE CASCADE`
   - `receivable_payments.company_id` -> `companies(id)` `ON DELETE CASCADE`, `customer_id` -> `receivable_customers(id)` `ON DELETE CASCADE`
   - `payable_payments.company_id` -> `companies(id)` `ON DELETE CASCADE`, `customer_id` -> `payable_customers(id)` `ON DELETE CASCADE`
   - `refresh_tokens.user_id` -> `users(id)` `ON DELETE CASCADE`
4. **Summary & Metric Views**: Defines 10 SQL views (`vw_receivable_debt_summary`, `vw_receivable_payment_summary`, `vw_receivable_total_debt_by_company`, `vw_receivable_total_payments_by_company`, `vw_payable_debt_summary`, `vw_payable_payment_summary`, `vw_payable_total_debt_by_company`, `vw_payable_total_payments_by_company`, `vw_receivable_payment_by_invoice`, `vw_payable_payment_by_invoice`).

---

## 4. Target Financial Models (`server/src/models/`)

All models inherit from `Model<InferAttributes<T>, InferCreationAttributes<T>>` in Sequelize, configured with `paranoid: true` (soft deletes via `deleted_at`) and standard timestamp columns (`created_at`, `updated_at`, `deleted_at`).

### Detailed Model Inventory

| Model Class | Model Name | Table Name | Primary Key | Soft Delete | Foreign Keys | Key Attributes & Virtual Fields |
|---|---|---|---|---|---|---|
| `Companies` | `"Companies"` | `companies` | `id` (UUID) | `deleted_at` | None | `name`, `phone`, `is_company`, `tax_number`, `tax_office`, `mersis_no`, `email`, `address`, `small_logo_path`, `large_logo_path` |
| `Users` | `"Users"` | `users` | `id` (UUID) | `deleted_at` | `company_id` -> `Companies`<br>`created_by` -> `Users`<br>`deleted_by` -> `Users` | `username`, `pass_hash`, `role`, `totp_secret`, `totp_enabled`, `totp_recovery_codes`, `totp_failed_attempts`, `totp_lockout_until` |
| `ReceivableCustomers` | `"ReceivableCustomers"` | `receivable_customers` | `id` (UUID) | `deleted_at` | `company_id` -> `Companies`<br>`created_by` -> `Users`<br>`deleted_by` -> `Users` | `name`, `phone`, `is_company`, `tax_number`, `tax_office`, `mersis_no`, `email`, `address` |
| `PayableCustomers` | `"PayableCustomers"` | `payable_customers` | `id` (UUID) | `deleted_at` | `company_id` -> `Companies`<br>`created_by` -> `Users`<br>`deleted_by` -> `Users` | `name`, `phone`, `is_company`, `tax_number`, `tax_office`, `mersis_no`, `email`, `address` |
| `ReceivableDebts` | `"ReceivableDebts"` | `receivable_debts` | `id` (UUID) | `deleted_at` | `company_id` -> `Companies`<br>`customer_id` -> `ReceivableCustomers`<br>`created_by` -> `Users`<br>`deleted_by` -> `Users` | `invoice_no`, `amount`, `discount`, `vat`, `withholding`, `currency`, `exchange_rate`, `issue_date`, `due_date`, `description`<br>**Virtuals**: `total` (`amount + vat - discount - withholding`), `total_in_try` (`total * exchange_rate`) |
| `PayableDebts` | `"PayableDebts"` | `payable_debts` | `id` (UUID) | `deleted_at` | `company_id` -> `Companies`<br>`customer_id` -> `PayableCustomers`<br>`created_by` -> `Users`<br>`deleted_by` -> `Users` | `invoice_no`, `amount`, `discount`, `vat`, `withholding`, `currency`, `exchange_rate`, `issue_date`, `due_date`, `description`<br>**Virtuals**: `total` (`amount + vat - discount - withholding`), `total_in_try` (`total * exchange_rate`) |
| `ReceivablePayments` | `"ReceivablePayments"` | `receivable_payments` | `id` (UUID) | `deleted_at` | `company_id` -> `Companies`<br>`customer_id` -> `ReceivableCustomers`<br>`created_by` -> `Users`<br>`deleted_by` -> `Users` | `amount`, `currency`, `exchange_rate`, `invoice_no`, `payment_date`, `description`, `payment_method`, `due_date`<br>**Virtuals**: `amount_in_try` (`amount * exchange_rate`) |
| `PayablePayments` | `"PayablePayments"` | `payable_payments` | `id` (UUID) | `deleted_at` | `company_id` -> `Companies`<br>`customer_id` -> `PayableCustomers`<br>`created_by` -> `Users`<br>`deleted_by` -> `Users` | `amount`, `currency`, `exchange_rate`, `invoice_no`, `payment_date`, `description`, `payment_method`, `due_date`<br>**Virtuals**: `amount_in_try` (`amount * exchange_rate`) |

---

## 5. Key Technical Observations for Future Audit Logging Implementation

1. **Soft-Delete Support (`paranoid: true`)**:
   All 8 financial models use `paranoid: true`. Audit logging must capture both soft deletion (`afterDestroy` hook) and restoration (`afterRestore` hook) in addition to creation (`afterCreate`) and updates (`afterUpdate`).
2. **Company Multitenancy (`company_id`)**:
   All 8 models are scoped by `company_id`. The proposed `audit_logs` table must include `company_id` as a required foreign key.
3. **User Tracking (`created_by`, `deleted_by`)**:
   Models track user references. Hook payloads should capture the active `user_id` performing the operation.
4. **Sequelize Virtual Fields**:
   Virtual fields (`total`, `total_in_try`, `amount_in_try`) are getters calculated dynamically; when capturing `old_values` and `new_values` for audit logs, standard model attributes (or `previous()` vs `dataValues`) should be serialized to JSON, filtering out virtual getters or handling them explicitly.

---

## Conclusion & Readiness

The codebase structure, migration patterns, and model definitions are fully mapped and ready for subsequent milestones (Milestone 2: Audit Logs Schema & Types, Milestone 3: Repository & Service, Milestone 4: Mutation Hooks Integration, Milestone 5: API Controller & Verification).
