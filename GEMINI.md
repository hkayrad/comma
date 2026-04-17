# Rules

- Remove temporary scripts after finishing the task

# Project Context

## Project Overview

**Comma** is a full-stack web application for managing financial transactions (receivables and payables). It features a modern React-based frontend and a robust Node.js/Express backend backed by a MariaDB database.

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn/ui.
*   **Backend:** Node.js, Express, TypeScript, Sequelize ORM.
*   **Database:** MariaDB.
*   **Architecture:** Monorepo-style structure separating `client` and `server`.

## Directory Structure

*   `client/`: Frontend application source code.
    *   `src/components/`: Reusable UI components that comes from shadcn or similar libraries.
    *   `src/layout/`: Page layouts and views.
    *   `src/layout/shared/`: User generated shared UI components.
    *   `src/lib/`: Utilities and API clients.
*   `server/`: Backend application source code.
    *   `controllers/`: Request handlers.
    *   `services/`: Business logic.
    *   `models/`: Sequelize database models.
    *   `lib/db/`: Database configuration (`sequelize.ts`).
*   `common/`: Shared type definitions (likely symlinked or copied).

## Building and Running

### Prerequisites
*   Node.js (v14+)
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
*   **API:** RESTful API design.
*   **Database:** Sequelize ORM is used for database interactions. Avoid raw SQL where possible, though migrations might use it (`migration.sql`).
