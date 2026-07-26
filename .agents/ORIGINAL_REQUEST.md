# Original User Request

## 2026-07-25T09:03:32Z

Implement comprehensive financial audit trail logging across all mutations (create, update, delete, restore) in the Comma backend and database, with repository tracking, Sequelize mutation hooks, and query APIs.

Working directory: `/home/hkayrad/Repos/comma`
Integrity mode: `development`

## Technical Implementation Plan

### 1. Database Schema (`audit_logs` table in `migration.sql`)
- Add table `audit_logs`:
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
  - Foreign Keys to `companies(id)` and `users(id)` (ON DELETE SET NULL).

### 2. Model & Types (`AuditLogs.ts` & `@comma/common`)
- Define TypeScript types in `@comma/common/types`: `AuditLogDto`, `AuditLogCreateDto`, `AuditLogAction`.
- Create Sequelize model `AuditLogs` in `server/src/models/AuditLogs.ts` and export from `server/src/models/index.ts`.

### 3. Repository & Service Layer (`AuditLogRepository.ts` & `AuditLogService.ts`)
- `AuditLogRepository.ts`:
  - `createLog(data, transaction)`
  - `findAllWithPagination(companyId, limit, offset, sorting, filters)`
- `AuditLogService.ts`:
  - `RecordAction(params)` helper for explicit or hook-driven audit entries.
  - `GetLogs(companyId, page, limit, sorting, filters)`.

### 4. Sequelize Hooks / Middleware Interceptors
- Attach lifecycle hooks (`afterCreate`, `afterUpdate`, `afterDestroy`, `afterRestore`) across financial models (`ReceivableDebts`, `PayableDebts`, `ReceivablePayments`, `PayablePayments`, `ReceivableCustomers`, `PayableCustomers`, `Users`, `Companies`).
- Record diffs of changed fields for updates (`old_values` vs `new_values`).

### 5. API Endpoint (`AuditLogController.ts`)
- Express endpoint `GET /admin/audit-logs` protected by authentication and company isolation.
- Controller tests in `server/src/tests/controllers/Admin/AuditLogController.test.ts` and service tests in `AuditLogService.test.ts`.

---

## Requirements

### R1. Database Model & Audit Trail System
Create `audit_logs` table, Sequelize model, repository, and service supporting mutation logging (`CREATE`, `UPDATE`, `DELETE`, `RESTORE`) with JSON diffs for modified fields.

### R2. Automated Mutation Logging
Hook mutations on receivables, payables, customers, users, and companies so that every record creation, edit, deletion, or restoration produces an audit trail entry with user and company isolation.

### R3. Audit Log Query API & Test Suite
Provide a paginated, filterable Express endpoint (`GET /admin/audit-logs`) and unit tests for repository, service, and controller verifying 100% test pass rate.

---

## Acceptance Criteria

### Audit Trail Core Functionality
- [ ] `audit_logs` table and Sequelize model exist and integrate cleanly with the DB.
- [ ] Mutations on financial models automatically record `entity_type`, `entity_id`, `action`, `old_values`, `new_values`, `user_id`, and `company_id`.
- [ ] `GET /admin/audit-logs` endpoint returns paginated, sortable, and filterable audit logs for the requesting user's company.
- [ ] All existing 384 tests plus new audit log unit/integration tests pass with 100% success rate.
