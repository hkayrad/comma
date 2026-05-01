# Coding Conventions

This document outlines the coding standards and architectural patterns for the Comma project.

## Client-Side Conventions (React + TypeScript)

### 1. Component Structure
- **Functional Components:** Use functional components with hooks. Avoid class components.
- **Naming:** Use **PascalCase** for component filenames and function names (e.g., `PaymentTable.tsx`).
- **Organization:**
    - Main pages/layouts are located in `src/layout/`.
    - Page-specific components reside in a `components/` subdirectory within the layout folder (e.g., `src/layout/payments/components/`).
    - Reusable UI primitives belong in `src/components/ui/` (managed via Shadcn/ui).

### 2. State & Data Fetching
- **Hooks:** Use `useState`, `useEffect`, and `useCallback` for local state and side effects.
- **API Interaction:** Encapsulate API calls within static classes in `src/lib/api/` (e.g., `ReceivablePaymentApi.GetAll()`).
- **Global State:** Use **Zustand** for global application state (auth, config, user settings). React Context is deprecated for global state and should only be used for low-frequency updates or dependency injection (e.g., dialogs, themes).
- **Selectors:** Always use fine-grained selectors when consuming Zustand stores to prevent unnecessary full-tree re-renders.

### 3. Styling
- **Tailwind CSS:** Use utility classes for all styling. Avoid custom CSS files unless strictly necessary.
- **Icons:** Use `lucide-react` for iconography.

### 4. Tables
- **Tanstack Table:** Use `@tanstack/react-table` for all data grids.
- **Server-side Logic:** Implement server-side pagination, sorting, and filtering using the `CommaTable` wrapper.

### 5. TypeScript & Imports
- **Typing:** Favor `interface` or `type` for all data structures and props.
- **Shared Resources:** Always use the `@comma/common` workspace alias for all shared types, enums, and constants.
- **Root Aliases:** Use `@/` to refer to the `src/` root.
- **Verbatim Module Syntax:** To ensure zero-cost emit and compliance with `verbatimModuleSyntax`, ALWAYS use `import type` when importing types or schemas from the common package.

---

## Server-Side Conventions (Node.js + Express)

### 1. Architecture
- **Layered Pattern:**
    - **Controllers:** Handle routing, request parsing, and response formatting. Located in `src/controllers/`.
    - **Services:** Contain business logic and database interactions. Located in `src/services/`.
    - **Models:** Define Sequelize schema and associations. Located in `src/models/`.

### 2. Naming Conventions
- **Controllers:** `[Entity]Controller.ts` (e.g., `PaymentsController.ts`).
- **Services:** `[Entity]Service.ts` (e.g., `PaymentsService.ts`).
- **Directories:** Use feature-based grouping (e.g., `Receivable/`, `Payable/`, `Admin/`).

### 3. API Standards
- **Responses:** Always return responses using the `ApiResponse` utility for consistent JSON structure. All API responses should adhere to the `ApiResponse` type defined in `@comma/common/types`.
- **Error Handling:**
    - Use `try-catch` blocks in controllers and services.
    - Backend errors are mapped to localized translation keys via the frontend's centralized global error mapper (Axios response interceptors).
    - Components should utilize the standardized `i18next` localized error strings provided by the interceptor rather than manual string extraction.
- **Status Codes:** Use appropriate HTTP status codes (200 for success, 500 for server errors, 401 for unauthorized).

### 4. Database & ORM
- **Sequelize:** Use Sequelize for all database operations.
- **Raw SQL:** Use `sequelize.query` for complex reports or multi-join operations that are difficult to express via the ORM.
- **Migrations:** Document database changes in SQL files (e.g., `migration.sql`).

### 5. Middleware & Validation
- **Auth:** Protect routes using `authMiddleware`.
- **Validation:** Utilize centralized Zod schemas from the `@comma/common/schemas` package for consistent validation across the frontend (request composition/forms) and backend (payload validation).

---

## General Conventions
- **Path Aliases:** Use `@/` to refer to the `src/` root in both client and server (if configured).
- **Logging:** Use the custom `Logger` utility instead of `console.log`.
- **Comments:** Comment the "why" for complex logic, not the "what".
