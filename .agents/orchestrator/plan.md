# Project Plan: Comprehensive Financial Audit Trail Logging

## Overview
Implement mutation logging (create, update, delete, restore) across financial models in the Comma backend and database, with repository tracking, Sequelize hooks, and query API (`GET /admin/audit-logs`).

## Architecture & Scope
- **Database**: `audit_logs` table in `migration.sql` with foreign keys to `companies` and `users`.
- **Common Types**: `@comma/common/types` (`AuditLogDto`, `AuditLogCreateDto`, `AuditLogAction`).
- **Sequelize Model**: `server/src/models/AuditLogs.ts` exported from `server/src/models/index.ts`.
- **Repository Layer**: `server/src/repositories/AuditLogRepository.ts`.
- **Service Layer**: `server/src/services/AuditLogService.ts`.
- **Mutation Hooks**: Sequelize lifecycle hooks (`afterCreate`, `afterUpdate`, `afterDestroy`, `afterRestore`) on models (`ReceivableDebts`, `PayableDebts`, `ReceivablePayments`, `PayablePayments`, `ReceivableCustomers`, `PayableCustomers`, `Users`, `Companies`).
- **API Controller**: `server/src/controllers/Admin/AuditLogController.ts` handling `GET /admin/audit-logs`.
- **Test Suite**: Controller tests (`AuditLogController.test.ts`), Service tests (`AuditLogService.test.ts`), and baseline test verification.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Architecture Analysis | Map existing models, migration patterns, common types, existing test runner setup, and hooks pattern | None | IN_PROGRESS |
| 2 | DB Schema & Common Types | Add `audit_logs` migration, `@comma/common` types, and `AuditLogs` Sequelize model | Milestone 1 | PLANNED |
| 3 | Repository & Service Layer | Implement `AuditLogRepository` and `AuditLogService` with `RecordAction` & `GetLogs` | Milestone 2 | PLANNED |
| 4 | Sequelize Mutation Hooks Integration | Attach mutation hooks (`afterCreate`, `afterUpdate`, `afterDestroy`, `afterRestore`) across target financial models | Milestone 3 | DONE |
| 5 | Controller API & Test Suite Verification | Implement `AuditLogController` for `GET /admin/audit-logs`, add tests, verify 100% test pass rate | Milestone 4 | IN_PROGRESS |

## Interface Contracts

### Common Types ↔ Server Models
- `AuditLogAction`: `'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'`
- `AuditLogDto`: `{ id: string, company_id: string, user_id?: string | null, entity_type: string, entity_id: string, action: AuditLogAction, old_values?: Record<string, any> | null, new_values?: Record<string, any> | null, ip_address?: string | null, user_agent?: string | null, created_at: Date }`
- `AuditLogCreateDto`: Omit `id` and `created_at` from `AuditLogDto`.

### Service Layer ↔ Controller / Hooks
- `AuditLogService.recordAction(params: AuditLogCreateDto, transaction?: Transaction): Promise<AuditLogDto>`
- `AuditLogService.getLogs(companyId: string, queryParams: { page?: number, limit?: number, sortBy?: string, order?: 'ASC' | 'DESC', filters?: Record<string, any> }): Promise<{ data: AuditLogDto[], total: number, page: number, limit: number }>`

## Verification Gates
Each milestone must pass:
1. Implementation worker reports build/test pass.
2. 2 Reviewers confirm code quality, security, and schema correctness.
3. 2 Challengers run verification tests / edge cases.
4. Forensic Auditor verdict is CLEAN (no integrity violations).
