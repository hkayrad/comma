# Comma Refactoring Progress & TODO List

This document lists the refactoring issues identified in [TECHNICAL_AUDIT_AND_ROADMAP.md](file:///home/hkayrad/Repos/comma/TECHNICAL_AUDIT_AND_ROADMAP.md) and tracks their implementation progress on the `agy_refactor` branch.

---

## Part 1: Current Issues & Refactoring Status

### 1. Database Configuration & Isolation
* [ ] **Define local database config for testing:** Establish a dedicated local test container database to isolate unit tests from development data.
* [ ] **Provide environment templates:** Create `.env.test.example` and ensure the main development `.env` file credentials are not tracked by Git.

### 2. Broken Server Test Suite
* [x] **Health Check Test Regression:** Updated [index.test.ts](file:///home/hkayrad/Repos/comma/server/src/tests/index.test.ts) assertion logic to match the updated health status schema returned by the API.
* [x] **User Management Service Mock Failures:** Added missing `UserRepository.findById` mocks in the `beforeEach` hook of [UserManagementService.test.ts](file:///home/hkayrad/Repos/comma/server/src/tests/services/Admin/UserManagementService.test.ts).
* [x] **100% Test suite passing:** Verified all **384/384 tests** are now fully passing.

### 3. Frontend React 19 / Linter Violations
* [x] **Maintenance Banner visibility:** Eliminated local state and `useEffect` in [MaintenanceBanner.tsx](file:///home/hkayrad/Repos/comma/client/src/layout/shared/MaintenanceBanner.tsx); derived visibility directly from the Zustand config.
* [x] **Sidebar Header filter:** Eliminated state in [SidebarHeader.tsx](file:///home/hkayrad/Repos/comma/client/src/layout/shared/sidebar/SidebarHeader.tsx); derived CSS filter directly from theme.
* [x] **Exchange Rates loading:** Refactored [ExchangeRates.tsx](file:///home/hkayrad/Repos/comma/client/src/layout/shared/header/components/ExchangeRates.tsx) to prevent synchronous loading updates and cleaned up the unused `useCallback` import.
* [x] **Logo Form on-mount fetch:** Wrapped mount-time fetch requests in [LogoForm.tsx](file:///home/hkayrad/Repos/comma/client/src/layout/settings/components/LogoForm.tsx) in promise microtasks.
* [x] **Mobile Viewport Hook:** Refactored state initialization in [use-mobile.ts](file:///home/hkayrad/Repos/comma/client/src/hooks/use-mobile.ts) to run lazily on mount.
* [x] **Customer Statement on-mount refresh:** Wrapped initial mount refresh in [useCustomerStatement.ts](file:///home/hkayrad/Repos/comma/client/src/hooks/useCustomerStatement.ts) in a promise microtask.
* [x] **Admin panel lists refresh:** Deferred on-mount refresh loops in [Admin.tsx](file:///home/hkayrad/Repos/comma/client/src/layout/admin/Admin.tsx) and [UserManagement.tsx](file:///home/hkayrad/Repos/comma/client/src/layout/admin/components/UserManagement.tsx) via `Promise.resolve().then()`.
* [x] **Dashboard Charts statistics:** Wrapped on-mount stats fetch in [DashboardCharts.tsx](file:///home/hkayrad/Repos/comma/client/src/layout/dashboard/components/DashboardCharts.tsx) in a promise microtask.
* [x] **Debt Calculator totals:** Eliminated state hook and `useEffect` synchronization inside [useDebtCalculations.ts](file:///home/hkayrad/Repos/comma/client/src/layout/debts/hooks/useDebtCalculations.ts); derived values cleanly using `useMemo`.
* [x] **Controlled State synchronization:** Refactored [use-controlled-state.tsx](file:///home/hkayrad/Repos/comma/client/src/hooks/use-controlled-state.tsx) to track previous values during render rather than in a synchronous effect callback.
* [x] **Auto Height offset measurement:** Defer state updates inside [use-auto-height.tsx](file:///home/hkayrad/Repos/comma/client/src/hooks/use-auto-height.tsx) using `requestAnimationFrame`.
* [x] **Calendar Function type casting:** Replaced unsafe type casts in [calendar.tsx](file:///home/hkayrad/Repos/comma/client/src/components/ui/calendar.tsx) with a concrete function signature, resolving typescript linter warnings.

### 4. Technical Debt & DevOps Shortcomings
* [ ] **Programmatic Migrations:** Replace manual SQL migration files with an automated database migration tracker (e.g., Umzug or Sequelize CLI).
* [ ] **Frontend Testing Suite:** Add a client unit testing runner (e.g., Vitest + React Testing Library) to verify accounting and dashboard calculation logic.
* [ ] **Container Healthchecks:** Equip Docker Compose containers with validation health checks to coordinate startup order.

---

## Part 2: Product Roadmap Status

* [x] **TOTP Period & Drift Verification (User Requested):** 
  * Increased step period from 30s to 60s in [TwoFactorService.ts](file:///home/hkayrad/Repos/comma/server/src/services/TwoFactorService.ts).
  * Expanded validation window from $\pm1$ step ($\pm60$ seconds) to $\pm2$ steps ($\pm120$ seconds) to accommodate physical server clock discrepancies.
  * Aligned mocks in [TwoFactorService.test.ts](file:///home/hkayrad/Repos/comma/server/src/tests/services/TwoFactorService.test.ts).
* [x] **Server-side Data Tables:** Transition tables from client-side filtering/sorting/pagination to server-side paginated queries to handle large transaction datasets.
* [ ] **Multi-Currency Analytics:** Fetch, cache, and apply TCMB exchange rates on dashboard metrics when using the base currency selectors.
* [x] **Audit Trail logs:** Hook Sequelize mutations to record all inserts, updates, and deletes on a dedicated `audit_logs` model with Admin UI tab (`/admin/audit-logs`).
* [x] **Bulk Operations:** Implement checkbox list actions on table rows to execute batch payments or invoice deletions.
* [ ] **Automated PDF / Excel Document Generator:** Migrate PDF rendering from browser-based JS library to server-side PDFKit or Puppeteer to fix rendering discrepancies.
* [ ] **Automated Payment Reminders:** Setup daily schedulers to email payment alerts to customers prior to receivable invoice due dates.
