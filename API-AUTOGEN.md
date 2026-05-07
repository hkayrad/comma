# Comma API Documentation

Automated API documentation generated from OpenAPI spec.

## Login to the application

- **Method:** `POST`
- **Endpoint:** `/login`

### Responses

- **200:** Successful login
- **401:** Unauthorized

---

## Refresh access token

- **Method:** `POST`
- **Endpoint:** `/refresh`

### Responses

- **200:** Token refreshed successfully
- **401:** Unauthorized

---

## Logout from the application

- **Method:** `POST`
- **Endpoint:** `/logout`

### Responses

- **200:** Logged out successfully

---

## Get all configurations

- **Method:** `GET`
- **Endpoint:** `/configs`

### Responses

- **200:** Successful retrieval of configs
- **404:** No configs found

---

## Set configuration

- **Method:** `POST`
- **Endpoint:** `/configs`
- **Description:** Requires Admin role

### Responses

- **200:** Config set successfully
- **403:** Unauthorized

---

## Get configuration by key

- **Method:** `GET`
- **Endpoint:** `/configs/{configKey}`

### Responses

- **200:** Successful retrieval of config
- **404:** Config not found

---

## Start maintenance mode

- **Method:** `POST`
- **Endpoint:** `/configs/start-maintenance`
- **Description:** Requires Admin role

### Responses

- **200:** Maintenance mode started successfully
- **403:** Unauthorized

---

## End maintenance mode

- **Method:** `POST`
- **Endpoint:** `/configs/end-maintenance`
- **Description:** Requires Admin role

### Responses

- **200:** Maintenance mode ended successfully
- **403:** Unauthorized

---

## Fetch TCMB exchange rates

- **Method:** `GET`
- **Endpoint:** `/tcmb`

### Responses

- **200:** Successful retrieval of exchange rates
- **500:** Error fetching TCMB data

---

## Update company details

- **Method:** `PUT`
- **Endpoint:** `/companies`

### Responses

- **200:** Company details updated successfully

---

## Get company details by ID (from session)

- **Method:** `GET`
- **Endpoint:** `/companies/id`

### Responses

- **200:** Successful retrieval of company details

---

## Upload small logo

- **Method:** `POST`
- **Endpoint:** `/companies/logo/small`

### Responses

- **200:** Logo uploaded successfully

---

## Delete small logo

- **Method:** `DELETE`
- **Endpoint:** `/companies/logo/small`

### Responses

- **200:** Logo deleted successfully

---

## Upload large logo

- **Method:** `POST`
- **Endpoint:** `/companies/logo/large`

### Responses

- **200:** Logo uploaded successfully

---

## Delete large logo

- **Method:** `DELETE`
- **Endpoint:** `/companies/logo/large`

### Responses

- **200:** Logo deleted successfully

---

## Get company logos

- **Method:** `GET`
- **Endpoint:** `/companies/logos`

### Responses

- **200:** Successful retrieval of logos

---

## Create a new company

- **Method:** `POST`
- **Endpoint:** `/admin/companies`

### Responses

- **200:** Company created successfully

---

## Get all companies

- **Method:** `GET`
- **Endpoint:** `/admin/companies`

### Responses

- **200:** Successful retrieval of companies

---

## Get company by ID

- **Method:** `GET`
- **Endpoint:** `/admin/companies/{id}`

### Responses

- **200:** Successful retrieval of company

---

## Update company

- **Method:** `PUT`
- **Endpoint:** `/admin/companies/{id}`

### Responses

- **200:** Company updated successfully

---

## Delete company

- **Method:** `DELETE`
- **Endpoint:** `/admin/companies/{id}`

### Responses

- **200:** Company deleted successfully

---

## Restore company

- **Method:** `POST`
- **Endpoint:** `/admin/companies/{id}/restore`

### Responses

- **200:** Company restored successfully

---

## Create a new user

- **Method:** `POST`
- **Endpoint:** `/admin/users`

### Responses

- **200:** User created successfully

---

## Get all users for a company

- **Method:** `GET`
- **Endpoint:** `/admin/users/company/{companyId}`

### Responses

- **200:** Successful retrieval of users

---

## Get user by ID

- **Method:** `GET`
- **Endpoint:** `/admin/users/{id}`

### Responses

- **200:** Successful retrieval of user

---

## Update user

- **Method:** `PUT`
- **Endpoint:** `/admin/users/{id}`

### Responses

- **200:** User updated successfully

---

## Delete user

- **Method:** `DELETE`
- **Endpoint:** `/admin/users/{id}`

### Responses

- **200:** User deleted successfully

---

## Restore user

- **Method:** `POST`
- **Endpoint:** `/admin/users/{id}/restore`

### Responses

- **200:** User restored successfully

---

## Reset user password

- **Method:** `POST`
- **Endpoint:** `/admin/users/{id}/reset-password`

### Responses

- **200:** Password reset successfully

---

## Create a new receivable customer

- **Method:** `POST`
- **Endpoint:** `/receivables/customers`

### Responses

- **200:** Customer created successfully

---

## Get all receivable customers

- **Method:** `GET`
- **Endpoint:** `/receivables/customers`

### Responses

- **200:** Successful retrieval of customers

---

## Create multiple receivable customers

- **Method:** `POST`
- **Endpoint:** `/receivables/customers/batch`

### Responses

- **201:** Customers created successfully

---

## Get customer statement

- **Method:** `GET`
- **Endpoint:** `/receivables/customers/{id}/statement`

### Responses

- **200:** Successful retrieval of statement

---

## Get customer IDs and names

- **Method:** `GET`
- **Endpoint:** `/receivables/customers/id-name`

### Responses

- **200:** Successful retrieval of customer IDs and names

---

## Update receivable customer

- **Method:** `PUT`
- **Endpoint:** `/receivables/customers/{id}`

### Responses

- **200:** Customer updated successfully

---

## Delete receivable customer

- **Method:** `DELETE`
- **Endpoint:** `/receivables/customers/{id}`

### Responses

- **200:** Customer deleted successfully

---

## Restore receivable customer

- **Method:** `POST`
- **Endpoint:** `/receivables/customers/{id}/restore`

### Responses

- **200:** Customer restored successfully

---

## Create a new receivable debt

- **Method:** `POST`
- **Endpoint:** `/receivables/debts`

### Responses

- **200:** Debt created successfully

---

## Get all receivable debts

- **Method:** `GET`
- **Endpoint:** `/receivables/debts`

### Responses

- **200:** Successful retrieval of debts

---

## Create multiple receivable debts

- **Method:** `POST`
- **Endpoint:** `/receivables/debts/batch`

### Responses

- **201:** Debts created successfully

---

## Get receivable debt totals

- **Method:** `GET`
- **Endpoint:** `/receivables/debts/totals`

### Responses

- **200:** Successful retrieval of debt totals

---

## Update receivable debt

- **Method:** `PUT`
- **Endpoint:** `/receivables/debts/{id}`

### Responses

- **200:** Debt updated successfully

---

## Delete receivable debt

- **Method:** `DELETE`
- **Endpoint:** `/receivables/debts/{id}`

### Responses

- **200:** Debt deleted successfully

---

## Restore receivable debt

- **Method:** `POST`
- **Endpoint:** `/receivables/debts/{id}/restore`

### Responses

- **200:** Debt restored successfully

---

## Get upcoming due dates for receivable debts

- **Method:** `GET`
- **Endpoint:** `/receivables/debts/upcoming-due-dates`

### Responses

- **200:** Successful retrieval of upcoming due dates

---

## Create a new receivable payment

- **Method:** `POST`
- **Endpoint:** `/receivables/payments`

### Responses

- **200:** Payment created successfully

---

## Get all receivable payments

- **Method:** `GET`
- **Endpoint:** `/receivables/payments`

### Responses

- **200:** Successful retrieval of payments

---

## Create multiple receivable payments

- **Method:** `POST`
- **Endpoint:** `/receivables/payments/batch`

### Responses

- **201:** Payments created successfully

---

## Update receivable payment

- **Method:** `PUT`
- **Endpoint:** `/receivables/payments/{id}`

### Responses

- **200:** Payment updated successfully

---

## Delete receivable payment

- **Method:** `DELETE`
- **Endpoint:** `/receivables/payments/{id}`

### Responses

- **200:** Payment deleted successfully

---

## Restore receivable payment

- **Method:** `POST`
- **Endpoint:** `/receivables/payments/{id}/restore`

### Responses

- **200:** Payment restored successfully

---

## Get upcoming checks for receivable payments

- **Method:** `GET`
- **Endpoint:** `/receivables/payments/upcoming-checks`

### Responses

- **200:** Successful retrieval of upcoming checks

---

## Create a new payable customer

- **Method:** `POST`
- **Endpoint:** `/payables/customers`

### Responses

- **200:** Customer created successfully

---

## Get all payable customers

- **Method:** `GET`
- **Endpoint:** `/payables/customers`

### Responses

- **200:** Successful retrieval of customers

---

## Create multiple payable customers

- **Method:** `POST`
- **Endpoint:** `/payables/customers/batch`

### Responses

- **201:** Customers created successfully

---

## Get customer statement

- **Method:** `GET`
- **Endpoint:** `/payables/customers/{id}/statement`

### Responses

- **200:** Successful retrieval of statement

---

## Get customer IDs and names

- **Method:** `GET`
- **Endpoint:** `/payables/customers/id-name`

### Responses

- **200:** Successful retrieval of customer IDs and names

---

## Update payable customer

- **Method:** `PUT`
- **Endpoint:** `/payables/customers/{id}`

### Responses

- **200:** Customer updated successfully

---

## Delete payable customer

- **Method:** `DELETE`
- **Endpoint:** `/payables/customers/{id}`

### Responses

- **200:** Customer deleted successfully

---

## Restore payable customer

- **Method:** `POST`
- **Endpoint:** `/payables/customers/{id}/restore`

### Responses

- **200:** Customer restored successfully

---

## Create a new payable debt

- **Method:** `POST`
- **Endpoint:** `/payables/debts`

### Responses

- **200:** Debt created successfully

---

## Get all payable debts

- **Method:** `GET`
- **Endpoint:** `/payables/debts`

### Responses

- **200:** Successful retrieval of debts

---

## Create multiple payable debts

- **Method:** `POST`
- **Endpoint:** `/payables/debts/batch`

### Responses

- **201:** Debts created successfully

---

## Get payable debt totals

- **Method:** `GET`
- **Endpoint:** `/payables/debts/totals`

### Responses

- **200:** Successful retrieval of debt totals

---

## Update payable debt

- **Method:** `PUT`
- **Endpoint:** `/payables/debts/{id}`

### Responses

- **200:** Debt updated successfully

---

## Delete payable debt

- **Method:** `DELETE`
- **Endpoint:** `/payables/debts/{id}`

### Responses

- **200:** Debt deleted successfully

---

## Restore payable debt

- **Method:** `POST`
- **Endpoint:** `/payables/debts/{id}/restore`

### Responses

- **200:** Debt restored successfully

---

## Get upcoming due dates for payable debts

- **Method:** `GET`
- **Endpoint:** `/payables/debts/upcoming-due-dates`

### Responses

- **200:** Successful retrieval of upcoming due dates

---

## Create a new payable payment

- **Method:** `POST`
- **Endpoint:** `/payables/payments`

### Responses

- **200:** Payment created successfully

---

## Get all payable payments

- **Method:** `GET`
- **Endpoint:** `/payables/payments`

### Responses

- **200:** Successful retrieval of payments

---

## Create multiple payable payments

- **Method:** `POST`
- **Endpoint:** `/payables/payments/batch`

### Responses

- **201:** Payments created successfully

---

## Update payable payment

- **Method:** `PUT`
- **Endpoint:** `/payables/payments/{id}`

### Responses

- **200:** Payment updated successfully

---

## Delete payable payment

- **Method:** `DELETE`
- **Endpoint:** `/payables/payments/{id}`

### Responses

- **200:** Payment deleted successfully

---

## Restore payable payment

- **Method:** `POST`
- **Endpoint:** `/payables/payments/{id}/restore`

### Responses

- **200:** Payment restored successfully

---

## Get upcoming checks for payable payments

- **Method:** `GET`
- **Endpoint:** `/payables/payments/upcoming-checks`

### Responses

- **200:** Successful retrieval of upcoming checks

---

## Update username

- **Method:** `PUT`
- **Endpoint:** `/settings/username`

### Responses

- **200:** Username updated successfully

---

## Update password

- **Method:** `PUT`
- **Endpoint:** `/settings/password`

### Responses

- **200:** Password updated successfully

---

## Check 2FA status

- **Method:** `GET`
- **Endpoint:** `/2fa/status`

### Responses

- **200:** 2FA status

---

## Initiate 2FA setup

- **Method:** `POST`
- **Endpoint:** `/2fa/setup`

### Responses

- **200:** 2FA setup data

---

## Verify 2FA setup

- **Method:** `POST`
- **Endpoint:** `/2fa/verify-setup`

### Responses

- **200:** 2FA setup completed

---

## Verify 2FA code during login

- **Method:** `POST`
- **Endpoint:** `/2fa/verify`

### Responses

- **200:** 2FA verified

---

## Use 2FA recovery code

- **Method:** `POST`
- **Endpoint:** `/2fa/recovery`

### Responses

- **200:** 2FA recovery code used

---

## Disable 2FA

- **Method:** `POST`
- **Endpoint:** `/2fa/disable`

### Responses

- **200:** 2FA disabled

---

## Get monthly statistics

- **Method:** `GET`
- **Endpoint:** `/stats/monthly`

### Responses

- **200:** Monthly statistics

---

## Customer portal login

- **Method:** `POST`
- **Endpoint:** `/portal/login`

### Responses

- **200:** Portal login successful

---

## Get public company info for portal

- **Method:** `GET`
- **Endpoint:** `/portal/company/{id}`

### Responses

- **200:** Public company info

---

## Get portal overview

- **Method:** `GET`
- **Endpoint:** `/portal/overview`

### Responses

- **200:** Portal overview

---

## Get portal statement

- **Method:** `GET`
- **Endpoint:** `/portal/statement`

### Responses

- **200:** Portal statement

---

