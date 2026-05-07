# Rules

# Project Context

## Project Overview

**Comma** is a full-stack web application for managing financial transactions (receivables and payables). It features a modern React-based frontend and a robust Node.js/Express backend backed by a MariaDB database.

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn/ui.
*   **Backend:** Node.js, Express, TypeScript, Sequelize ORM.
*   **Database:** MariaDB.
*   **Architecture:** Monorepo-style structure separating `client` and `server`.

## Directory Structure

*   `client/`: Frontend application source code (Vite).
    *   `src/components/`: Reusable UI components from shadcn or similar.
    *   `src/layout/`: Page layouts and views.
    *   `src/stores/`: Zustand state stores.
    *   `src/lib/`: Utilities and API clients.
*   `server/`: Backend application source code (Express).
    *   `controllers/`: Request handlers.
    *   `services/`: Business logic.
    *   `models/`: Sequelize database models.
    *   `lib/db/`: Database configuration (`sequelize.ts`).
*   `common/`: Shared workspace (`@comma/common`).
    *   `src/auth/`: Auth-related types and schemas.
    *   `src/customers/`: Customer-related types and schemas.
    *   `src/debts/`: Debt-related types and schemas.
    *   `src/payments/`: Payment-related types and schemas.
    *   `src/companies/`: Company-related types and schemas.
    *   `src/config/`: Config-related types and schemas.
    *   `src/shared/`: Shared utilities and base types.

## Building and Running

### Prerequisites
*   Node.js (v18.20+)
*   MariaDB (Running and configured)

### Quick Start (Development)
The project includes helper scripts in the root directory:

*   **Start Development Servers:**
    ```bash
    ./start.sh
    ```
    This runs `npm run dev` in both `client` and `server` directories concurrently.

*   **Build for Production:**
    ```bash
    ./build.sh
    ```
    This builds the frontend (Vite) and backend (TypeScript compilation).

### Manual Commands

**Frontend (`client/`):**
*   `npm install`: Install dependencies.
*   `npm run dev`: Start Vite development server.
*   `npm run build`: Build for production.

**Backend (`server/`):**
*   `npm install`: Install dependencies.
*   `npm run dev`: Start Express development server (with `tsx` watch).
*   `npm run build`: Compile TypeScript to `dist/`.

## Configuration

*   **Environment Variables:**
    *   Backend requires a `.env` file in `server/`.
    *   Key variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `SERVER_PORT`.
    *   See `README.md` for the full list of required variables.

## Development Conventions

*   **Language:** TypeScript is used for both client and server.
*   **Styling:** Tailwind CSS with Shadcn/ui components.
*   **State Management:** **Zustand** is the standard for frontend global state. React Context is deprecated for global state.
*   **Path Aliases:** Always use `@/` for root source paths and `@comma/common` for shared code.
*   **Validation:** Use centralized **Zod validation schemas** from `@comma/common/schemas` for all new API-related work.
*   **API:** RESTful API design.
*   **Database:** Sequelize ORM is used for database interactions. Avoid raw SQL where possible, though migrations might use it (`migration.sql`). High-performance SQL views are used for complex aggregations.
