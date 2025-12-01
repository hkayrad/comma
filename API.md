# API Documentation

## Authentication
Base URL: `/`

### Login
- **Method:** `POST`
- **Endpoint:** `/login`
- **Description:** Authenticates a user and returns access and refresh tokens.
- **Request Body:**
  - `username` (string): The username of the user.
  - `password` (string): The password of the user.
- **Response:**
  - `username` (string): The username of the authenticated user.
  - `role` (number): The role of the authenticated user.
  - Sets `access_token` and `refresh_token` cookies.

### Refresh Token
- **Method:** `POST`
- **Endpoint:** `/refresh`
- **Description:** Refreshes the access token using the refresh token cookie.
- **Request Cookies:**
  - `refresh_token`: The refresh token.
- **Response:**
  - `username` (string): The username of the user.
  - `role` (number): The role of the user.
  - Sets new `access_token` cookie.

### Logout
- **Method:** `POST`
- **Endpoint:** `/logout`
- **Description:** Logs out the user by clearing the authentication cookies.
- **Response:**
  - `message` (string): "Logged out successfully"

## Configuration
Base URL: `/configs`

### Get All Configs
- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** Retrieves all configuration key-value pairs.
- **Response:**
  - `success` (boolean): True if successful.
  - `configs` (object): Key-value pairs of configurations.

### Get Config by Key
- **Method:** `GET`
- **Endpoint:** `/:configKey`
- **Description:** Retrieves a specific configuration by its key.
- **Parameters:**
  - `configKey` (string): The key of the configuration to retrieve.
- **Response:**
  - `success` (boolean): True if successful.
  - `configKey` (string): The requested key.
  - `configValue` (string): The value of the configuration.

### Set Config (Admin Only)
- **Method:** `POST`
- **Endpoint:** `/`
- **Description:** Sets or updates a configuration key-value pair. Requires role 99 (Admin).
- **Request Body:**
  - `configKey` (string): The key of the configuration.
  - `configValue` (string): The value of the configuration.
- **Response:**
  - `success` (boolean): True if successful.
  - `message` (string): "Config set successfully"

### Start Maintenance Mode (Admin Only)
- **Method:** `POST`
- **Endpoint:** `/start-maintenance`
- **Description:** Puts the application into maintenance mode. Requires role 99 (Admin).
- **Response:**
  - `success` (boolean): True if successful.
  - `message` (string): "Maintenance mode started successfully"

### End Maintenance Mode (Admin Only)
- **Method:** `POST`
- **Endpoint:** `/end-maintenance`
- **Description:** Takes the application out of maintenance mode. Requires role 99 (Admin).
- **Response:**
  - `success` (boolean): True if successful.
  - `message` (string): "Maintenance mode ended successfully"

## TCMB (Exchange Rates)
Base URL: `/tcmb`

### Get Exchange Rates
- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** Fetches current exchange rates (USD, EUR) from the Central Bank of the Republic of Turkey (TCMB).
- **Response:**
  - `date` (string): The date of the exchange rates.
  - `usd` (object): USD exchange rates (ForexBuying, ForexSelling, BanknoteBuying, BanknoteSelling).
  - `eur` (object): EUR exchange rates (ForexBuying, ForexSelling, BanknoteBuying, BanknoteSelling).

## Company Management (User)
Base URL: `/companies`

### Update Company Details
- **Method:** `PUT`
- **Endpoint:** `/`
- **Description:** Updates the details of the authenticated user's company.
- **Request Body:**
  - `CompanyDto` object (details vary based on DTO definition).
- **Response:**
  - `success` (boolean): True if successful.

### Get Company by ID
- **Method:** `GET`
- **Endpoint:** `/id`
- **Description:** Retrieves the details of the authenticated user's company.
- **Response:**
  - `success` (boolean): True if successful.
  - Company details object.

### Upload Small Logo
- **Method:** `POST`
- **Endpoint:** `/logo/small`
- **Description:** Uploads a small logo for the company.
- **Request Files:**
  - `logo`: The image file to upload.
- **Response:**
  - `success` (boolean): True if successful.

### Upload Large Logo
- **Method:** `POST`
- **Endpoint:** `/logo/large`
- **Description:** Uploads a large logo for the company.
- **Request Files:**
  - `logo`: The image file to upload.
- **Response:**
  - `success` (boolean): True if successful.

### Delete Small Logo
- **Method:** `DELETE`
- **Endpoint:** `/logo/small`
- **Description:** Deletes the small logo of the company.
- **Response:**
  - `success` (boolean): True if successful.

### Delete Large Logo
- **Method:** `DELETE`
- **Endpoint:** `/logo/large`
- **Description:** Deletes the large logo of the company.
- **Response:**
  - `success` (boolean): True if successful.

### Get Logos
- **Method:** `GET`
- **Endpoint:** `/logos`
- **Description:** Retrieves the URLs of the company's logos.
- **Response:**
  - `success` (boolean): True if successful.
  - Logo URLs object.

## Receivables
Base URL: `/receivables`

### Customers

#### Create Customer
- **Method:** `POST`
- **Endpoint:** `/customers`
- **Description:** Creates a new receivable customer.
- **Request Body:**
  - `CustomerDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Get All Customers
- **Method:** `GET`
- **Endpoint:** `/customers`
- **Description:** Retrieves all receivable customers for the company.
- **Response:**
  - `success` (boolean): True if successful.
  - List of customers.

#### Get Customer Statement
- **Method:** `GET`
- **Endpoint:** `/customers/:id/statement`
- **Description:** Retrieves the financial statement for a specific customer.
- **Parameters:**
  - `id` (string): The customer ID.
- **Query Parameters:**
  - `startDate` (string, optional): Start date for the statement.
  - `endDate` (string, optional): End date for the statement.
- **Response:**
  - `success` (boolean): True if successful.
  - Statement data.

#### Get Customer IDs and Names
- **Method:** `GET`
- **Endpoint:** `/customers/id-name`
- **Description:** Retrieves a list of customer IDs and names (lightweight list).
- **Response:**
  - `success` (boolean): True if successful.
  - List of {id, name} objects.

#### Update Customer
- **Method:** `PUT`
- **Endpoint:** `/customers/:id`
- **Description:** Updates a specific receivable customer.
- **Parameters:**
  - `id` (string): The customer ID.
- **Request Body:**
  - `CustomerDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Delete Customer
- **Method:** `DELETE`
- **Endpoint:** `/customers/:id`
- **Description:** Deletes a specific receivable customer.
- **Parameters:**
  - `id` (string): The customer ID.
- **Response:**
  - `success` (boolean): True if successful.

### Debts

#### Create Debt
- **Method:** `POST`
- **Endpoint:** `/debts`
- **Description:** Creates a new debt record for a receivable customer.
- **Request Body:**
  - `DebtDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Get Debt Totals
- **Method:** `GET`
- **Endpoint:** `/debts/totals`
- **Description:** Retrieves total debt amounts.
- **Query Parameters:**
  - `currency` (string, optional): Currency filter.
- **Response:**
  - `success` (boolean): True if successful.
  - Totals object.

#### Get All Debts
- **Method:** `GET`
- **Endpoint:** `/debts`
- **Description:** Retrieves all debt records.
- **Response:**
  - `success` (boolean): True if successful.
  - List of debts.

#### Update Debt
- **Method:** `PUT`
- **Endpoint:** `/debts/:id`
- **Description:** Updates a specific debt record.
- **Parameters:**
  - `id` (string): The debt ID.
- **Request Body:**
  - `DebtDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Delete Debt
- **Method:** `DELETE`
- **Endpoint:** `/debts/:id`
- **Description:** Deletes a specific debt record.
- **Parameters:**
  - `id` (string): The debt ID.
- **Response:**
  - `success` (boolean): True if successful.

### Payments

#### Create Payment
- **Method:** `POST`
- **Endpoint:** `/payments`
- **Description:** Records a payment for a receivable debt.
- **Request Body:**
  - `PaymentDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Get All Payments
- **Method:** `GET`
- **Endpoint:** `/payments`
- **Description:** Retrieves all payment records.
- **Response:**
  - `success` (boolean): True if successful.
  - List of payments.

#### Update Payment
- **Method:** `PUT`
- **Endpoint:** `/payments/:id`
- **Description:** Updates a specific payment record.
- **Parameters:**
  - `id` (string): The payment ID.
- **Request Body:**
  - `PaymentDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Delete Payment
- **Method:** `DELETE`
- **Endpoint:** `/payments/:id`
- **Description:** Deletes a specific payment record.
- **Parameters:**
  - `id` (string): The payment ID.
- **Response:**
  - `success` (boolean): True if successful.

## Payables
Base URL: `/payables`

### Customers

#### Create Customer
- **Method:** `POST`
- **Endpoint:** `/customers`
- **Description:** Creates a new payable customer (vendor/supplier).
- **Request Body:**
  - `CustomerDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Get All Customers
- **Method:** `GET`
- **Endpoint:** `/customers`
- **Description:** Retrieves all payable customers.
- **Response:**
  - `success` (boolean): True if successful.
  - List of customers.

#### Get Customer Statement
- **Method:** `GET`
- **Endpoint:** `/customers/:id/statement`
- **Description:** Retrieves the financial statement for a specific payable customer.
- **Parameters:**
  - `id` (string): The customer ID.
- **Query Parameters:**
  - `startDate` (string, optional): Start date for the statement.
  - `endDate` (string, optional): End date for the statement.
- **Response:**
  - `success` (boolean): True if successful.
  - Statement data.

#### Get Customer IDs and Names
- **Method:** `GET`
- **Endpoint:** `/customers/id-name`
- **Description:** Retrieves a list of payable customer IDs and names.
- **Response:**
  - `success` (boolean): True if successful.
  - List of {id, name} objects.

#### Update Customer
- **Method:** `PUT`
- **Endpoint:** `/customers/:id`
- **Description:** Updates a specific payable customer.
- **Parameters:**
  - `id` (string): The customer ID.
- **Request Body:**
  - `CustomerDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Delete Customer
- **Method:** `DELETE`
- **Endpoint:** `/customers/:id`
- **Description:** Deletes a specific payable customer.
- **Parameters:**
  - `id` (string): The customer ID.
- **Response:**
  - `success` (boolean): True if successful.

### Debts

#### Create Debt
- **Method:** `POST`
- **Endpoint:** `/debts`
- **Description:** Creates a new debt record (bill) for a payable customer.
- **Request Body:**
  - `DebtDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Get Debt Totals
- **Method:** `GET`
- **Endpoint:** `/debts/totals`
- **Description:** Retrieves total payable debt amounts.
- **Query Parameters:**
  - `currency` (string, optional): Currency filter.
- **Response:**
  - `success` (boolean): True if successful.
  - Totals object.

#### Get All Debts
- **Method:** `GET`
- **Endpoint:** `/debts`
- **Description:** Retrieves all payable debt records.
- **Response:**
  - `success` (boolean): True if successful.
  - List of debts.

#### Update Debt
- **Method:** `PUT`
- **Endpoint:** `/debts/:id`
- **Description:** Updates a specific payable debt record.
- **Parameters:**
  - `id` (string): The debt ID.
- **Request Body:**
  - `DebtDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Delete Debt
- **Method:** `DELETE`
- **Endpoint:** `/debts/:id`
- **Description:** Deletes a specific payable debt record.
- **Parameters:**
  - `id` (string): The debt ID.
- **Response:**
  - `success` (boolean): True if successful.

### Payments

#### Create Payment
- **Method:** `POST`
- **Endpoint:** `/payments`
- **Description:** Records a payment made for a payable debt.
- **Request Body:**
  - `PaymentDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Get All Payments
- **Method:** `GET`
- **Endpoint:** `/payments`
- **Description:** Retrieves all payable payment records.
- **Response:**
  - `success` (boolean): True if successful.
  - List of payments.

#### Update Payment
- **Method:** `PUT`
- **Endpoint:** `/payments/:id`
- **Description:** Updates a specific payable payment record.
- **Parameters:**
  - `id` (string): The payment ID.
- **Request Body:**
  - `PaymentDto` object.
- **Response:**
  - `success` (boolean): True if successful.

#### Delete Payment
- **Method:** `DELETE`
- **Endpoint:** `/payments/:id`
- **Description:** Deletes a specific payable payment record.
- **Parameters:**
  - `id` (string): The payment ID.
- **Response:**
  - `success` (boolean): True if successful.

## Admin
Base URL: `/admin`

### Company Management
Base URL: `/admin/companies`

#### Create Company
- **Method:** `POST`
- **Endpoint:** `/`
- **Description:** Creates a new company.
- **Request Body:**
  - Company creation details.
- **Response:**
  - Result object.

#### Get All Companies
- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** Retrieves all companies.
- **Response:**
  - List of companies.

#### Get Company by ID
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Description:** Retrieves a specific company by its ID.
- **Parameters:**
  - `id` (string): The company ID.
- **Response:**
  - Company details.
