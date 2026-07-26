# Analysis Report: `@comma/common` Package Structure, Repository & Service Paradigms

## Executive Summary
This report analyzes the structure of `@comma/common`, the monorepo linkage, and the design patterns across `server/src/repositories/` and `server/src/services/`. The findings provide direct architectural guidance for implementing `@comma/common` audit log types, `AuditLogRepository`, and `AuditLogService`.

---

## 1. `@comma/common` Package Structure & Export Linkage

### 1.1 File & Directory Layout
Location: `common/`
```
common/
├── package.json          # Name: "@comma/common", build script: "tsc --build"
├── tsconfig.json        # OutDir: "./dist", RootDir: "./src", composite: true
└── src/
    ├── index.ts          # Barrel export for openapi, types, schemas, enums, constants
    ├── types.ts          # Re-exports all domain types (auth, customers, debts, payments, companies, config, shared, portal)
    ├── schemas.ts        # Re-exports all Zod validation schemas
    ├── enums.ts          # Exports UserRole enum
    ├── constants.ts      # Exports role IDs, admin UUID constants
    ├── shared/
    │   ├── types.ts      # UUID, ApiResponse<T>, SortItem, FilterItem, Totals
    │   └── schemas.ts    # paginationSchema (page, limit, sorting, filters)
    ├── auth/             # UserDto, CreateUserDto, DecodedJwtToken, schemas
    ├── companies/        # CompanyDto, schemas
    ├── customers/        # CustomerDto, schemas
    ├── debts/            # DebtDto, UpcomingDueDate, schemas
    └── payments/         # PaymentDto, schemas
```

### 1.2 Package Export & Monorepo Linkage
1. **Root Monorepo Config** (`package.json`):
   - Configured with `"workspaces": ["common", "client", "server"]`.
2. **Package Name** (`common/package.json`):
   - Package name: `"@comma/common"`.
   - Entry point: `"main": "./dist/index.js"`, `"types": "./dist/index.d.ts"`.
3. **TypeScript Path Mapping** (`server/tsconfig.json`):
   ```json
   "paths": {
     "@comma/common": ["../common/src/index"],
     "@comma/common/*": ["../common/src/*"]
   }
   ```
   This allows imports in server code directly referencing source files, such as:
   - `import { CompanyDto, UUID, SortItem, FilterItem } from "@comma/common/types";`
   - `import { paginationSchema } from "@comma/common/schemas";`
   - `import { UserRole } from "@comma/common/enums";`
4. **Server Dependencies** (`server/package.json`):
   - Declares `"@comma/common": "*"`.

---

## 2. Repository Layer Analysis (`server/src/repositories/`)

### 2.1 Repository Class Design
The repository layer contains two distinct class paradigms:

1. **Static Utility Class Repositories** (Single-domain entities):
   - Examples: `CompanyRepository.ts`, `UserRepository.ts`, `ConfigRepository.ts`.
   - Design: All methods are `static async` methods.
   - Example: `CompanyRepository.findById(id: UUID, transaction?: Transaction)`

2. **Domain-Instantiated Repositories** (Dual-domain entities with receivable/payable variants):
   - Examples: `CustomerRepository.ts`, `DebtRepository.ts`, `PaymentRepository.ts`.
   - Design: Class accepts a domain discriminator (`"receivable" | "payable"`) in its constructor and dynamically resolves target models (`ReceivableDebts` vs `PayableDebts`).
   - Example:
     ```ts
     export type DebtDomain = "receivable" | "payable";
     export class DebtRepository {
       private domain: DebtDomain;
       constructor(domain: DebtDomain) { this.domain = domain; }
     }
     ```

### 2.2 Transaction Handling
- **Convention**: Every database operation (`create`, `update`, `delete`, `restore`, `findById`, etc.) accepts an optional `transaction?: Transaction` parameter as its last argument.
- **Pass-through**: Transactions are directly passed into Sequelize model queries:
  ```ts
  static async create(companyData: Partial<CompanyDto>, transaction?: Transaction) {
    return await Companies.create(companyData as Companies["_creationAttributes"], { transaction });
  }
  ```
- **Batching**: `createBatch(data: any[], transaction?: Transaction)` passes `transaction` into `bulkCreate(data, { transaction })`.

### 2.3 Pagination & Filtering Paradigm
- **Input Parameters**:
  - `limit: number`, `offset: number` (where `offset = page * limit`, 0-indexed).
  - `sorting: SortItem[] = []` where `SortItem = { id: string, desc: boolean }`.
  - `filters: FilterItem[] = []` where `FilterItem = { id: string, value: string | string[] | boolean }`.
- **Query Execution Paradigms**:
  1. **Raw SQL with Parameterized Replacements** (`CompanyRepository`, `UserRepository`, `PaymentRepository`):
     - Safe string building with `?` or `IN (?)` replacements.
     - `sequelize.query(countQuery, { replacements, type: QueryTypes.SELECT })`
     - `sequelize.query(dataQuery, { replacements: [...replacements, limit, offset], type: QueryTypes.SELECT })`
  2. **Sequelize `findAndCountAll` with Operators** (`DebtRepository`):
     - Uses `Op.like`, `Op.in`, `literal()`, `include` for associations.
- **Standard Return Type**: `{ rows: T[]; count: number }`.

---

## 3. Service Layer Analysis (`server/src/services/`)

### 3.1 Service Class Paradigms & Method Signatures
- **Class Structure**: Services use `static async` methods (e.g. `ReceivableDebtsService.Create(...)`, `CompanyManagementService.GetAll(...)`).
- **Generic Service Inheritance**: `BaseCustomerService` provides common logic for `ReceivableCustomersService` and `PayableCustomersService`.
- **Signature Conventions**:
  - `Create(dto: TDto, userId: UUID, companyId: UUID): Promise<UUID | TResult>`
  - `GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []): Promise<{ rows: TDto[]; count: number }>`
  - `GetById(id: UUID, companyId?: UUID): Promise<TDto>`
  - `Update(id: UUID, dto: Partial<TDto>, companyId: UUID): Promise<void | TDto>`
  - `Delete(id: UUID, userId: UUID, companyId: UUID): Promise<void>`
  - `Restore(id: UUID, userId: UUID, companyId: UUID): Promise<void>`

### 3.2 Dependency Injection & Instantiation
- Repositories are instantiated at the module top-level as static singletons for domain services (e.g. `const repo = new DebtRepository("receivable");`), or accessed statically for static repositories (e.g. `CompanyRepository.create(...)`).
- Services are exported as default classes or named export classes.

### 3.3 Transaction Management in Services
- Services manage transactions across multiple repository calls using `sequelize.transaction(async (t) => { ... })`.
- Transaction `t` is passed explicitly to repository methods (e.g. `await repo.createBatch(batchData, t)`).

### 3.4 Error Handling & Validation
- **Custom Error Classes** (`server/src/lib/errors/AppError.ts`):
  - `AppError` (Base error, status 500, `isOperational: true`)
  - `ValidationError` (status 400) - Thrown when required fields are missing or input validation fails.
  - `NotFoundError` (status 404) - Thrown when resource doesn't exist or query returns 0 affected rows.
  - `UnauthorizedError` (status 401)
  - `ForbiddenError` (status 403)
- **Logging**: Uses `Logger` (`Logger.info`, `Logger.debug`, `Logger.error`) from `@/lib/utils/logger`.

---

## 4. Recommendations for Audit Log Infrastructure

### 4.1 Common Types (`@comma/common`)
Add audit log types in `common/src/shared/types.ts` or `common/src/audit/types.ts` and export via `common/src/types.ts` & `common/src/schemas.ts`:
- `AuditLogAction`: `'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'`
- `AuditLogDto`
- `AuditLogCreateDto`

### 4.2 Repository (`AuditLogRepository.ts`)
- Use **Static Utility Class Paradigm** (`export class AuditLogRepository`).
- Method `create(logData: AuditLogCreateDto, transaction?: Transaction)` accepting optional transaction.
- Method `findAllWithPagination(companyId: UUID, limit: number, offset: number, sorting: SortItem[], filters: FilterItem[])` returning `{ rows: AuditLogDto[]; count: number }`.

### 4.3 Service (`AuditLogService.ts`)
- Use **Static Service Paradigm** (`export class AuditLogService`).
- Method `recordAction(params: AuditLogCreateDto, transaction?: Transaction): Promise<AuditLogDto>`
- Method `getLogs(companyId: string, queryParams: { page?: number; limit?: number; sorting?: SortItem[]; filters?: FilterItem[] }): Promise<{ rows: AuditLogDto[]; count: number }>`
- Proper validation using `ValidationError` and entity lookup using `NotFoundError` when applicable.
