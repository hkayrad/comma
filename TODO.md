# Comma Project TODO List

This file tracks technical debt, maintenance tasks, and planned feature expansions for the Comma monorepo.

## Critical & Quick Fixes
- [x] **Fix Portal Logo URL:** Resolve hardcoded `/logo.webp` in `client/src/layout/portal/PortalDashboard.tsx` to use `customer.small_logo_path`.
- [x] **Secure Docker Secrets:** Move hardcoded credentials (JWT_SECRET, etc.) from `docker-compose.yml` to a secure `.env` or Docker Secrets.
- [x] **Startup Validation:** Implement environment variable validation (e.g., using `envalid`) in `server/src/index.ts`.

## Quality & Testing
- [ ] **Backend Coverage:** Increase test coverage for `Receivable` and `Payable` services in `server/src/tests`.
- [x] **OpenAPI Integration:** Automate API documentation generation to keep `API.md` in sync with Express routes.

## UI Testing
- [ ] **Frontend Testing Suite:** Setup Vitest + React Testing Library in `client/`.
- [ ] **Core UI Tests:** Add tests for financial components and calculation utilities in the frontend.

## DevOps & CI/CD
- [ ] **CI Pipeline:** Create GitHub Actions to automate linting, type-checking, and testing on PRs.
- [ ] **Database Migrations:** Transition from `migration.sql` to a programmatic migration tool (Sequelize-CLI/Umzug).
- [ ] **Container Health:** Add `healthcheck` to `docker-compose.yml` for MariaDB and Server.

## Performance & DX
- [ ] **Image Optimization:** Implement automated image resizing/optimization for logos using `sharp`.
- [ ] **Global Loading States:** Add a centralized loading indicator for API-heavy interactions.
- [ ] **Cross-Platform Scripts:** Consolidate `build.sh` and `build.ps1` into a unified Node-based task runner.

## Feature Expansions
- [ ] **Server-side Data Tables:** Implement server-side filtering, sorting, and pagination for large datasets.
- [ ] **Bulk Actions:** Add support for bulk status updates and reminders.
- [ ] **Multi-Currency Analytics:** Add a base-currency toggle to the dashboard using TCMB rates.
- [ ] **Audit Logs:** Implement a tracking system for all modifications to financial records.

---
*Last Updated: 2026-05-07*
