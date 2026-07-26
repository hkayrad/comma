# Detailed Architectural Analysis: Sequelize Hooks, Authentication Context & Admin Controllers

## Executive Summary
This report provides a detailed investigation of the Sequelize model architecture, authentication/company context flow, and Admin controller patterns within `@comma/server`. The investigation supports the implementation of Milestone 1–5 for the Comprehensive Financial Audit Trail Logging system.

---

## 1. Sequelize Model Lifecycle Hooks & Soft Delete Architecture

### Current State Assessment
- **Hook Usage**: **0 hooks** currently exist in `server/src/models/` or anywhere in `server/src/`.
- **Model Pattern**: Models extend Sequelize `Model<InferAttributes<T>, InferCreationAttributes<T>>` and invoke `Model.init(...)`.
- **Soft Delete Configuration**: Financial models (`ReceivableDebts`, `PayableDebts`, `ReceivablePayments`, `PayablePayments`, `ReceivableCustomers`, `PayableCustomers`, `Users`, `Companies`) use:
  - `createdAt: "created_at"`
  - `updatedAt: "updated_at"`
  - `deletedAt: "deleted_at"`
  - `paranoid: true`

### Sequelize Hook Capabilities (Sequelize v6.37.8)
Sequelize lifecycle hooks operate on model instances and model classes. The key hooks required for audit log capture are:
1. **`afterCreate(instance, options)`**: Fires after a new record is saved. `instance.dataValues` or `instance.get({ plain: true })` provides `new_values`.
2. **`afterUpdate(instance, options)`**: Fires after a record is updated.
   - `instance.changed()` returns an array of attribute names modified in the update.
   - `instance.previous()` returns a dictionary of values prior to the update.
   - `instance.dataValues` provides the updated state.
   - Diff calculation: `old_values` can be constructed by picking `instance.previous(key)` for all keys in `instance.changed()`.
3. **`afterDestroy(instance, options)`**:
   - Under `paranoid: true`, `instance.destroy(options)` sets `deleted_at` to the current timestamp and triggers `afterDestroy`.
   - `instance.dataValues` or `instance.previous()` retains the entity state before deletion.
4. **`afterRestore(instance, options)`**:
   - `instance.restore(options)` clears `deleted_at` and triggers `afterRestore`.

### Target Financial Models for Mutation Hooks
The following 8 models require audit hooks:
1. `ReceivableDebts` (`server/src/models/ReceivableDebts.ts`)
2. `PayableDebts` (`server/src/models/PayableDebts.ts`)
3. `ReceivablePayments` (`server/src/models/ReceivablePayments.ts`)
4. `PayablePayments` (`server/src/models/PayablePayments.ts`)
5. `ReceivableCustomers` (`server/src/models/ReceivableCustomers.ts`)
6. `PayableCustomers` (`server/src/models/PayableCustomers.ts`)
7. `Users` (`server/src/models/Users.ts`)
8. `Companies` (`server/src/models/Companies.ts`)

### Context Propagation to Hooks
Sequelize hook callbacks receive `(instance, options)`. Options passed into `.create(data, options)`, `.update(data, options)`, `.destroy(options)`, `.restore(options)` are forwarded directly to hooks. This enables passing transaction objects (`options.transaction`) as well as custom context metadata (`options.user_id`, `options.ip_address`, `options.user_agent`, `options.company_id`).

---

## 2. Authentication & Company Context Extraction

### Request Flow & Middleware Architecture
- **JWT Verification**: `authMiddleware` (in `server/src/lib/middleware.ts`) extracts `access_token` from `req.cookies.access_token`, verifies it using `jwt.verify(token, env.JWT_SECRET)`, and sets `req.user`.
- **AuthenticatedUser Structure** (`server/src/index.ts`):
  ```typescript
  export interface AuthenticatedUser {
    id: string;
    companyId: string;
    username: string;
    role: number; // UserRole.USER (0), UserRole.ADMIN (1), UserRole.PORTAL_CUSTOMER (2)
  }
  ```
- **Admin Verification**: `adminMiddleware` wraps `authMiddleware` and checks `req.user.role === UserRole.ADMIN` (returns 403 Forbidden if not admin).
- **Client IP & User Agent**:
  - Express app configures `app.set("trust proxy", 1)` (`server/src/index.ts:55`).
  - IP Address: `req.ip` or `req.headers['x-forwarded-for']`.
  - User Agent: `req.headers['user-agent']`.

### Context Extraction & AsyncLocalStorage Analysis
- **Current Parameter Passing**: `req.user.id` and `req.user.companyId` are currently passed explicitly through method parameters from Controllers to Services to Repositories.
- **AsyncLocalStorage (ALS)**: Currently **0 usages** in the codebase.
- **Recommendation for Audit Context**:
  - Implementing an `AsyncLocalStorage` request context middleware (e.g., `auditContextStore` in `server/src/lib/middleware.ts` or `server/src/lib/utils/context.ts`) allows wrapping incoming requests:
    ```typescript
    import { AsyncLocalStorage } from "node:async_hooks";
    export interface RequestContext {
      userId?: string;
      companyId?: string;
      ipAddress?: string;
      userAgent?: string;
    }
    export const requestContext = new AsyncLocalStorage<RequestContext>();
    ```
  - This allows Sequelize hooks or `AuditLogService` to retrieve active user context without altering signature contracts of all existing repositories.

---

## 3. Admin Controller Conventions & API Patterns

### Existing Admin Controllers Analysis
Located in `server/src/controllers/Admin/`:
1. `CompanyManagementController.ts` (`/admin/companies`)
2. `UserManagementController.ts` (`/admin/users`)

### Standard Controller Conventions
1. **Route Protection**: `router.use(adminMiddleware)` declared at top of router module.
2. **Validation**: `validate(schema, "body" | "query")` middleware using Zod schemas from `@comma/common/schemas`.
3. **Async Error Handling**: `asyncHandler(async (req, res) => { ... })` catches errors and forwards to `errorHandler` middleware.
4. **Rate Limiting**: `authRateLimiter` applied on write operations (`POST`, `PUT`, `DELETE`).
5. **Logging**: Structured logging using `Logger.info("[ControllerName] operation", metadata)`.
6. **Response Envelope**: Standard JSON output format:
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "Optional descriptive text"
   }
   ```

### Pagination, Sorting & Filter Query Standards
- Query validation uses `paginationSchema` from `@comma/common/schemas`:
  - `page`: default `0` (0-based page index)
  - `limit`: default `20`, max `100`
  - `sorting`: optional JSON-encoded array `[{ id: string, desc: boolean }]`
  - `filters`: optional JSON-encoded array `[{ id: string, value: any }]`
- Controllers extract `const { page, limit, sorting, filters } = req.query as any;` and pass to service layer.
- Service layer computes `offset = page * limit` and passes pagination details to repository layer.

### Contract for `AuditLogController` (`GET /admin/audit-logs`)
- Route: `GET /admin/audit-logs`
- Protection: `adminMiddleware`
- Query Validation: `validate(auditLogQuerySchema, "query")` or `validate(paginationSchema, "query")`
- Output Format:
  ```json
  {
    "success": true,
    "data": {
      "rows": [ /* AuditLogDto */ ],
      "count": 100,
      "page": 0,
      "limit": 20
    }
  }
  ```

---

## 4. Test Suite Conventions (`server/src/tests/`)

### Test Framework & Setup
- **Runner**: Vitest (`vitest run`).
- **HTTP Testing**: Supertest (`request(app)`).
- **Environment**: Global database connection initialized in `src/tests/setup.ts` using `.env.test`.

### Controller Testing Patterns
- Spying on service methods: `vi.spyOn(ServiceClass, 'MethodName').mockResolvedValue(...)`.
- Resetting mocks before each test: `beforeEach(() => { vi.restoreAllMocks(); });`.
- Supertest Admin Auth Authentication:
  ```typescript
  const adminToken = jwt.sign(
    { id: ADMIN_USER_ID, role: UserRole.ADMIN, companyId: ADMIN_COMPANY_ID },
    process.env.JWT_SECRET as string
  );

  const response = await request(app)
    .get('/admin/audit-logs')
    .set('Cookie', [`access_token=${adminToken}`]);
  ```

---

## Conclusion & Architecture Recommendations
1. **Sequelize Hooks Integration**: Define lifecycle hooks (`afterCreate`, `afterUpdate`, `afterDestroy`, `afterRestore`) across target financial models, dispatching calls to `AuditLogService.recordAction`.
2. **Context Passing Strategy**: Implement Express request context middleware using `AsyncLocalStorage` or pass audit context in Sequelize options (`{ user_id, company_id, ip_address, user_agent, transaction }`).
3. **Admin Controller Alignment**: Implement `AuditLogController.ts` in `server/src/controllers/Admin/` following established routing, validation, error handling, and response envelope patterns.
