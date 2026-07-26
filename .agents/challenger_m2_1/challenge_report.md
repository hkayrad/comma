# Challenge Report: Milestone 2 (DB Schema & Common Types)

**Verifier**: Challenger (`teamwork_preview_challenger`)  
**Target Scope**: Milestone 2 — `audit_logs` SQL migration, `@comma/common` types, and `AuditLogs` Sequelize model  
**Date**: 2026-07-25  

---

## Challenge Summary

**Overall risk assessment**: **LOW** (All model definitions, type declarations, serialization behaviors, and unit tests pass cleanly. 2 minor schema/validation improvements identified).

- Existing test suite passed: **48 / 48 test files**, **399 / 399 tests** (including challenger test suite).
- Empirical test suite created: `server/src/tests/models/AuditLogsChallenger.test.ts` (13 tests passing).

---

## Challenges & Failure Mode Analysis

### 1. [Medium] MySQL Foreign Key Constraint Inconsistency (`company_id ON DELETE SET NULL`)

- **Assumption challenged**: Database foreign key constraints match application-level nullability expectations.
- **Attack scenario**: In `migration.sql` (lines 158 & 168):
  ```sql
  company_id UUID NOT NULL,
  ...
  CONSTRAINT fk_audit_logs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
  ```
  `company_id` is declared `NOT NULL`, but its foreign key constraint is configured with `ON DELETE SET NULL`. If a parent `Company` record is deleted directly in the database, MySQL/MariaDB will reject the deletion with ER_BAD_NULL_ERROR (`1048: Column 'company_id' cannot be null`).
- **Blast radius**: Database error on company deletion if foreign key cascading is relied upon.
- **Mitigation**: Update `migration.sql` constraint to `ON DELETE CASCADE` if audit logs should be purged with company deletion, or change `company_id` column to `UUID NULL` if audit logs should be retained with NULL company reference.

---

### 2. [Low] Absence of Model-Level Enum Validation on `action` Field

- **Assumption challenged**: Sequelize model enforces the `AuditLogAction` enum (`'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'`).
- **Attack scenario**: In `server/src/models/AuditLogs.ts` (line 54):
  ```ts
  action: {
      type: DataTypes.STRING(20),
      allowNull: false,
  }
  ```
  The model relies on TypeScript types but does not define `validate: { isIn: [["CREATE", "UPDATE", "DELETE", "RESTORE"]] }`. Calling `AuditLogs.build({ action: "INVALID_ACTION" }).validate()` resolves successfully because any string up to 20 characters is accepted by default.
- **Blast radius**: Non-conforming action strings could be inserted into the database if the service/repository layer bypasses type safety.
- **Mitigation**: Add model-level validation:
  ```ts
  action: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
          isIn: [["CREATE", "UPDATE", "DELETE", "RESTORE"]],
      },
  }
  ```

---

### 3. [Low] Default Nullability Handling in Model Instantiation

- **Assumption challenged**: Optional model fields default to `undefined` when omitted during `build()`.
- **Empirical Observation**: Omitted optional fields (`user_id`, `old_values`, `new_values`, `ip_address`, `user_agent`) default to `null` due to `defaultValue: null` settings in `AuditLogs.init(...)`.
- **Blast radius**: None (behavior is consistent and correct for database compatibility).

---

## Stress Test Results

Executed via `npx vitest run src/tests/models/AuditLogsChallenger.test.ts`:

| Scenario | Expected Behavior | Actual Behavior | Result |
|----------|-------------------|-----------------|--------|
| Required fields validation (`company_id`, `entity_type`, `entity_id`, `action`) | `log.validate()` rejects missing required fields | Rejects with `ValidationError` | **PASS** |
| Field length boundary (`entity_type` = 50 chars) | Accepted up to 50 chars | 50-char string set successfully | **PASS** |
| IPv6 length boundary (`ip_address` = 45 chars) | Accepted up to 45 chars | 45-char IPv6 string set successfully | **PASS** |
| JSON Serialization / Deserialization (`old_values`, `new_values`) | Support nested objects, arrays, booleans, nulls, and Unicode (`Türkçe 🚀 ₺`) | Deep equality verified after `JSON.parse(JSON.stringify(...))` | **PASS** |
| Default Nullability | Omitted optional fields default to `null` | All optional fields evaluate to `null` | **PASS** |
| Model Associations | Associations `company` and `user` defined | Associated targets point to `Companies` and `Users` models | **PASS** |
| DTO Type Compatibility | `AuditLogDto` and `AuditLogCreateDto` cast cleanly to/from model | Type mapping verified | **PASS** |

---

## Unchallenged Areas

- **Repository and Service Layer logic**: Scope of Milestone 3.
- **Sequelize Mutation Hooks integration**: Scope of Milestone 4.
- **API Controller endpoints**: Scope of Milestone 5.
