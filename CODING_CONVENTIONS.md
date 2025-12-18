# Coding Conventions

This document outlines the coding standards and architectural patterns for the hks-io project.

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
- **Global Context:** Use React Context for global state (auth, config, dialogs) located in `src/contexts/`.

### 3. Styling
- **Tailwind CSS:** Use utility classes for all styling. Avoid custom CSS files unless strictly necessary.
- **Icons:** Use `lucide-react` for iconography.

### 4. Tables
- **Tanstack Table:** Use `@tanstack/react-table` for all data grids.
- **Server-side Logic:** Implement server-side pagination, sorting, and filtering using the `HksTable` wrapper.

### 5. TypeScript
- **Typing:** Favor `interface` or `type` for all data structures and props.
- **Shared Types:** Utilize types from the root `common/` directory for consistency with the backend.

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
- **Responses:** Always return responses using the `ApiResponse` utility for consistent JSON structure.
- **Error Handling:** Use `try-catch` blocks in controllers and services. Log errors using the custom `Logger` utility.
- **Status Codes:** Use appropriate HTTP status codes (200 for success, 500 for server errors, 401 for unauthorized).

### 4. Database & ORM
- **Sequelize:** Use Sequelize for all database operations.
- **Raw SQL:** Use `sequelize.query` for complex reports or multi-join operations that are difficult to express via the ORM.
- **Migrations:** Document database changes in SQL files (e.g., `migration.sql`).

### 5. Middleware
- **Auth:** Protect routes using `authMiddleware`.
- **Validation:** (TODO) Implement request body validation using Zod or a similar library.

---

## General Conventions
- **Path Aliases:** Use `@/` to refer to the `src/` root in both client and server (if configured).
- **Logging:** Use the custom `Logger` utility instead of `console.log`.
- **Comments:** Comment the "why" for complex logic, not the "what".
