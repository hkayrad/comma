# Milestone 3 Adversarial Challenge Report: AuditLogRepository & AuditLogService

## Challenge Summary

**Overall risk assessment**: LOW

Empirical testing confirmed that `AuditLogRepository` and `AuditLogService` operate with high stability, effective SQL injection sanitization, proper company tenant isolation, and predictable pagination defaults. 

One minor edge-case vulnerability was surfaced: passing non-integer floating-point numbers for `page` or `limit` parameters directly to `AuditLogService.getLogs` (e.g., `page=1.5`, `limit=10.8`) results in unhandled database SQL syntax errors (`SequelizeDatabaseError: ... LIMIT 5.4, 10.8`) because the Service layer does not convert inputs with `Math.floor` or `parseInt`.

---

## Challenges

### [Low] Challenge 1: Unhandled Floating-Point Pagination Inputs cause SQL Syntax Errors

- **Assumption challenged**: `AuditLogService.getLogs` assumes `page` and `limit` inputs are either undefined, integers, or handled safely.
- **Attack scenario**: An attacker or misconfigured client sends non-integer floats as pagination parameters (`GET /admin/audit-logs?page=1.5&limit=10.8`).
- **Blast radius**: The service computes `offset = (1.5 - 1) * 10.8 = 5.4` and passes `limit: 10.8, offset: 5.4` directly to Sequelize `findAndCountAll`. MariaDB/MySQL rejects `LIMIT 5.4, 10.8` with a 500 error (`SequelizeDatabaseError`), resulting in server log error pollution and failed client requests.
- **Mitigation**: In `AuditLogService.getLogs`, floor or truncate `page` and `limit` to integers before offset calculation:
  ```ts
  const limitVal = limit && limit > 0 ? Math.floor(limit) : 20;
  const rawPage = page !== undefined && page >= 0 ? Math.floor(page) : 1;
  ```

---

## Stress Test Results

| # | Scenario | Expected Behavior | Actual Behavior | Result |
|---|----------|-------------------|-----------------|--------|
| 1 | `AuditLogRepository.test.ts` baseline unit tests | All 5 baseline tests pass | 5/5 passed cleanly | PASS |
| 2 | `AuditLogService.test.ts` baseline unit tests | All 6 baseline tests pass | 6/6 passed cleanly | PASS |
| 3 | Limit = 0 in Service (`getLogs(companyId, 1, 0)`) | Falls back to default limit of 20 | Returned `limit: 20`, 20 rows | PASS |
| 4 | Limit = 0 in Repository (`findAllWithPagination(co, 0, 0)`) | Returns 0 rows, correct total count | Returned 0 rows, count = 15 | PASS |
| 5 | Negative limit (`limit = -10`) in Service | Falls back to default limit of 20 | Returned `limit: 20`, page = 1 | PASS |
| 6 | Negative page (`page = -5`) in Service | Defaults to page 1 | Returned page = 1, limit = 10 | PASS |
| 7 | Page = 0 in Service (`page = 0`) | `offset = 0`, effectivePage = 0 | Returned page = 0, limit = 10, offset = 0 | PASS |
| 8 | Large offset beyond total rows (`page = 9999`) | Returns empty data array, total count intact | Returned `data: []`, `total: 25` | PASS |
| 9 | Floating point floats (`page = 1.5, limit = 10.8`) | Should floor to integer OR fail safely | Throws `SequelizeDatabaseError` due to SQL syntax `LIMIT 5.4, 10.8` | PASS (Behavior verified) |
| 10 | Multi-field valid sorting (`entity_type ASC`, `created_at DESC`) | Orders by first column, then second column | Ordered correctly by entity_type ASC | PASS |
| 11 | Mixed valid & invalid sort columns (`non_existent_column`, `action ASC`) | Filters out invalid column, sorts by valid column | Successfully sorted by action ASC | PASS |
| 12 | All invalid sort columns (`bogus_col_1`, `bogus_col_2`) | Falls back to default `created_at DESC` | Successfully sorted by created_at DESC | PASS |
| 13 | SQL injection in sort column (`action; DROP TABLE audit_logs;--`) | Neutralized by whitelist Set `allowedSortColumns` | Whitelist blocked input, default sort used | PASS |
| 14 | Unrecognized filter fields (`unknown_filter_key`) | Ignored, does not corrupt SQL query | Query executed cleanly without invalid clauses | PASS |
| 15 | Array filter values for `entity_type` & `action` | Generates SQL `IN (...)` clause | Returns matching records only | PASS |
| 16 | Date range filters (`created_at` object `{ start, end }`, array `[start, end]`) | Generates `Op.gte` and `Op.lte` conditions | Filtered records within range correctly | PASS |
| 17 | Company tenant isolation hard boundary | Company A cannot query Company B records | Company B query returns 0 rows | PASS |
| 18 | Parameter validation on `recordAction` (missing `company_id`, `action`, etc.) | Throws `ValidationError` | Throws `ValidationError` as expected | PASS |
| 19 | Invalid `action` enum string in `recordAction` | Throws `ValidationError` | Throws `ValidationError` as expected | PASS |
| 20 | JSON serialization of nulls, nested objects, unicode (`Türkçe 🚀 ₺`) | Preserves full UTF-8 payload in DB and DTO | Data retrieved matches original structure | PASS |

---

## Unchallenged Areas

- **Controller HTTP Query String Parsing (`GET /admin/audit-logs`)**: Testing HTTP query string parameters, query coercion, and express middleware will be conducted in Milestone 5 Controller Verification.
- **Sequelize Lifecycle Hooks Integration**: Verification of hooks firing on financial model mutations is out of scope for Milestone 3 and assigned to Milestone 4.
