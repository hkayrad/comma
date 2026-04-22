# Comma

Comma is a full-stack financial management application designed to streamline the tracking of receivables and payables for businesses. Built with modern web technologies, it provides a comprehensive suite of tools for managing financial transactions, customer relationships, and business operations with enterprise-grade security and performance.

## Overview

Comma offers a robust platform for businesses to manage their financial health through an intuitive interface and powerful backend architecture. The application supports multi-currency transactions, real-time notifications, and provides detailed financial reporting capabilities.

### Key Features

- **Financial Dashboard**: Real-time overview of receivables, payables, and cash flow metrics
- **Debt Management**: Complete lifecycle management of debts with support for discounts, withholding taxes, and multi-currency
- **Payment Processing**: Flexible payment recording with partial payments and comprehensive payment history
- **Customer Management**: Centralized customer database with transaction history and financial statements
- **Security**: JWT-based authentication with two-factor support and role-based access control
- **Real-time Updates**: WebSocket-powered notifications for payment events and system alerts
- **Responsive Design**: Optimized experience across desktop and mobile devices
- **Multi-language Support**: Internationalization with English and Turkish language support
- **Advanced Reporting**: Customer statements, financial summaries, and export capabilities

## Quick Start

### Prerequisites

- **Node.js**: v18 or later
- **npm**: v9 or later  
- **MariaDB**: v10.6 or later
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hakan-Kimya/comma.git
   cd comma
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies  
   cd ../server && npm install
   ```

3. **Database Setup**
   ```bash
   # Create MariaDB database
   mysql -u root -p
   CREATE DATABASE comma;
   
   # Run migrations (if applicable)
   # See migration.sql for database schema
   ```

4. **Environment Configuration**
   
   Create `.env` file in `server/` directory:
   ```env
   # Server Configuration
   SERVER_PORT=3001
   NODE_ENV=development
   
   # Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=comma
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   JWT_ISSUER=comma
   JWT_AUDIENCE=comma-users
   
   # External Services
   TCMB_API_KEY=your_tcmb_api_key
   PROXY_URL=your_proxy_url
   PROXY_API_KEY=your_proxy_api_key
   
   # Client
   CLIENT_URL=http://localhost:5173
   ```

### Running the Application

**Option 1: Using the startup script**
```bash
chmod +x start.sh
./start.sh
```

**Option 2: Manual startup**
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend  
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Architecture

### Monorepo & Shared Code
The `@comma/common` package facilitates cross-workspace type safety and schema validation. By centralizing Zod schemas and TypeScript interfaces, we ensure that the frontend and backend are always in sync regarding data structures and validation rules.

### Performance & Aggregations
The application leverages high-performance SQL views (e.g., `vw_receivable_debt_summary`, `vw_payable_payment_summary`) for complex financial aggregations. This offloads heavy computation to the database layer, ensuring fast response times even with large datasets.

### Technology Stack

#### Frontend
- **React 19.2.3** - Modern UI library with hooks
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.3.0** - Fast build tool and dev server
- **Zustand 5.0.0** - Lightweight state management
- **Tailwind CSS 4.1.18** - Utility-first styling
- **Shadcn/ui** - High-quality component library
- **Tanstack Table** - Powerful data grid solution
- **React Router 7.11.0** - Client-side routing
- **React Hook Form 7.68.0** - Form management
- **i18next** - Internationalization support

#### Backend
- **Node.js** - JavaScript runtime
- **Express 5.2.1** - Web framework
- **TypeScript 5.9.3** - Type-safe backend development
- **tsc-alias** - Path alias resolution for builds
- **Sequelize 6.37.7** - ORM for database operations
- **MariaDB 3.4.5** - Database engine
- **JWT 9.0.3** - Authentication tokens
- **WebSocket 8.18.3** - Real-time communication
- **bcrypt 6.0.0** - Password hashing
- **OTPAuth 9.4.1** - Two-factor authentication

### Project Structure

The project uses a monorepo-style structure with a dedicated shared workspace for cross-cutting concerns.

```
comma/
├── client/                 # React frontend application (Vite)
│   ├── src/
│   │   ├── layout/        # Page components and layouts
│   │   ├── components/    # Reusable UI components
│   │   ├── stores/        # Zustand state stores
│   │   ├── lib/          # Utilities and API clients
│   │   └── locales/      # Internationalization files
│   ├── package.json
│   └── vite.config.ts
├── server/                # Node.js backend application (Express)
│   ├── controllers/      # Route handlers
│   ├── services/         # Business logic layer
│   ├── models/           # Database models
│   ├── lib/              # Utilities and middleware
│   └── index.ts          # Application entry point
├── common/                # Shared workspace (@comma/common)
│   ├── src/
│   │   ├── auth/         # Auth-related types and schemas
│   │   ├── customers/    # Customer-related types and schemas
│   │   ├── debts/        # Debt-related types and schemas
│   │   ├── payments/     # Payment-related types and schemas
│   │   ├── companies/    # Company-related types and schemas
│   │   ├── config/       # Config-related types and schemas
│   │   └── shared/       # Shared utilities and base types
│   └── package.json
├── build/                # Production build output
├── start.sh             # Development startup script
├── migration.sql        # Database schema migrations
├── API.md              # API documentation
├── CODING_CONVENTIONS.md # Development guidelines
└── README.md           # This file
```

### Path Aliases

Standardized path aliases are used across the workspace to ensure clean imports:
- `@/*`: Maps to the root source directory of the respective workspace (`client/src` or `server/`).
- `@comma/common`: Maps to the shared `common/` workspace for type safety and schema validation.

## Performance

The application is optimized for performance with:
- **Code Splitting**: Reduced initial bundle size
- **Lazy Loading**: Components loaded on demand
- **Production Optimization**: Minified and compressed assets
- **Database Indexing**: Optimized query performance

Recent performance metrics (LCP ~550ms) demonstrate excellent loading times and user experience.

## Development

### Coding Standards

This project follows strict coding conventions outlined in [CODING_CONVENTIONS.md](CODING_CONVENTIONS.md):

- **Frontend**: Functional React components with TypeScript, Tailwind CSS utility classes
- **Backend**: Layered architecture with controllers, services, and models
- **Database**: Sequelize ORM with raw SQL for complex queries
- **API**: RESTful endpoints with consistent response structure

### Available Scripts

#### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

#### Server
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript
npm run serve    # Start production server
```

## API Documentation

Comprehensive API documentation is available in [API.md](API.md), covering:

- Authentication endpoints
- Receivables and payables management
- Customer operations
- Payment processing
- Admin functions
- Configuration management

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Two-Factor Authentication**: Optional 2FA using TOTP
- **Role-Based Access Control**: Granular permissions system
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Request sanitization and validation
- **Secure Headers**: CORS and security middleware

## Internationalization

The application supports multiple languages:
- **English** (default)
- **Türkçe** (Turkish)

Language files are located in `client/src/locales/` and can be easily extended for additional languages.

## License

This project is closed-source. All rights are reserved. See [LICENSE.md](LICENSE.md) for more details.

## Contributing

For development guidelines and coding standards, please refer to [CODING_CONVENTIONS.md](CODING_CONVENTIONS.md).

---

**Version**: 2.7.2  
**Author**: Hakan Kayra Doğan  
**Last Updated**: 2025-12-22
