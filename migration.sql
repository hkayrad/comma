SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- 1. DROP FOREIGN KEYS
-- ---------------------------------------------------------

-- Users
ALTER TABLE users DROP FOREIGN KEY fk_users_company;
ALTER TABLE users DROP FOREIGN KEY fk_users_created_by;
ALTER TABLE users DROP FOREIGN KEY fk_users_deleted_by;
ALTER TABLE users DROP FOREIGN KEY fk_users_company_id;

-- Receivable Customers
ALTER TABLE receivable_customers DROP FOREIGN KEY fk_receivable_customers_company;
ALTER TABLE receivable_customers DROP FOREIGN KEY fk_receivable_customers_created_by;
ALTER TABLE receivable_customers DROP FOREIGN KEY fk_receivable_customers_deleted_by;

-- Payable Customers
ALTER TABLE payable_customers DROP FOREIGN KEY fk_payable_customers_company;
ALTER TABLE payable_customers DROP FOREIGN KEY fk_payable_customers_created_by;
ALTER TABLE payable_customers DROP FOREIGN KEY fk_payable_customers_deleted_by;

-- Receivable Debts
ALTER TABLE receivable_debts DROP FOREIGN KEY fk_receivable_debts_company;
ALTER TABLE receivable_debts DROP FOREIGN KEY fk_receivable_debts_created_by;
ALTER TABLE receivable_debts DROP FOREIGN KEY fk_receivable_debts_deleted_by;
ALTER TABLE receivable_debts DROP FOREIGN KEY receivable_debts_ibfk_1;

-- Payable Debts
ALTER TABLE payable_debts DROP FOREIGN KEY fk_payable_debts_company;
ALTER TABLE payable_debts DROP FOREIGN KEY fk_payable_debts_created_by;
ALTER TABLE payable_debts DROP FOREIGN KEY fk_payable_debts_deleted_by;
ALTER TABLE payable_debts DROP FOREIGN KEY fk_payable_debts_customer;
ALTER TABLE payable_debts DROP FOREIGN KEY customer_id_fk;

-- Receivable Payments
ALTER TABLE receivable_payments DROP FOREIGN KEY fk_receivable_payments_company;
ALTER TABLE receivable_payments DROP FOREIGN KEY fk_receivable_payments_created_by;
ALTER TABLE receivable_payments DROP FOREIGN KEY fk_receivable_payments_deleted_by;
ALTER TABLE receivable_payments DROP FOREIGN KEY receivable_payments_ibfk_1;

-- Payable Payments
ALTER TABLE payable_payments DROP FOREIGN KEY fk_payable_payments_company;
ALTER TABLE payable_payments DROP FOREIGN KEY fk_payable_payments_created_by;
ALTER TABLE payable_payments DROP FOREIGN KEY fk_payable_payments_deleted_by;
ALTER TABLE payable_payments DROP FOREIGN KEY customer_id_ibfk;
ALTER TABLE payable_payments DROP FOREIGN KEY customer_id_ibfk_1;

-- Refresh Tokens
ALTER TABLE refresh_tokens DROP FOREIGN KEY fk_refresh_tokens_user;


-- ---------------------------------------------------------
-- 2. MODIFY COLUMNS (to UUID)
-- ---------------------------------------------------------

ALTER TABLE companies MODIFY COLUMN id UUID NOT NULL;

ALTER TABLE users MODIFY COLUMN id UUID NOT NULL;
ALTER TABLE users MODIFY COLUMN company_id UUID NOT NULL;
ALTER TABLE users MODIFY COLUMN created_by UUID NOT NULL;
ALTER TABLE users MODIFY COLUMN deleted_by UUID NOT NULL;

ALTER TABLE receivable_customers MODIFY COLUMN id UUID NOT NULL;
ALTER TABLE receivable_customers MODIFY COLUMN company_id UUID NOT NULL;
ALTER TABLE receivable_customers MODIFY COLUMN created_by UUID NOT NULL;
ALTER TABLE receivable_customers MODIFY COLUMN deleted_by UUID NOT NULL;

ALTER TABLE payable_customers MODIFY COLUMN id UUID NOT NULL;
ALTER TABLE payable_customers MODIFY COLUMN company_id UUID NOT NULL;
ALTER TABLE payable_customers MODIFY COLUMN created_by UUID NOT NULL;
ALTER TABLE payable_customers MODIFY COLUMN deleted_by UUID NOT NULL;

ALTER TABLE receivable_debts MODIFY COLUMN id UUID NOT NULL;
ALTER TABLE receivable_debts MODIFY COLUMN company_id UUID NOT NULL;
ALTER TABLE receivable_debts MODIFY COLUMN customer_id UUID NOT NULL;
ALTER TABLE receivable_debts MODIFY COLUMN created_by UUID NOT NULL;
ALTER TABLE receivable_debts MODIFY COLUMN deleted_by UUID NOT NULL;

ALTER TABLE payable_debts MODIFY COLUMN id UUID NOT NULL;
ALTER TABLE payable_debts MODIFY COLUMN company_id UUID NOT NULL;
ALTER TABLE payable_debts MODIFY COLUMN customer_id UUID NOT NULL;
ALTER TABLE payable_debts MODIFY COLUMN created_by UUID NOT NULL;
ALTER TABLE payable_debts MODIFY COLUMN deleted_by UUID NOT NULL;

ALTER TABLE receivable_payments MODIFY COLUMN id UUID NOT NULL;
ALTER TABLE receivable_payments MODIFY COLUMN company_id UUID NOT NULL;
ALTER TABLE receivable_payments MODIFY COLUMN customer_id UUID NOT NULL;
ALTER TABLE receivable_payments MODIFY COLUMN created_by UUID NOT NULL;
ALTER TABLE receivable_payments MODIFY COLUMN deleted_by UUID NOT NULL;

ALTER TABLE payable_payments MODIFY COLUMN id UUID NOT NULL;
ALTER TABLE payable_payments MODIFY COLUMN company_id UUID NOT NULL;
ALTER TABLE payable_payments MODIFY COLUMN customer_id UUID NOT NULL;
ALTER TABLE payable_payments MODIFY COLUMN created_by UUID NOT NULL;
ALTER TABLE payable_payments MODIFY COLUMN deleted_by UUID NOT NULL;

ALTER TABLE refresh_tokens MODIFY COLUMN id UUID NOT NULL;
ALTER TABLE refresh_tokens MODIFY COLUMN user_id UUID NOT NULL;


-- ---------------------------------------------------------
-- 3. RE-CREATE FOREIGN KEYS
-- ---------------------------------------------------------

-- Users
ALTER TABLE users ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE users ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Receivable Customers
ALTER TABLE receivable_customers ADD CONSTRAINT fk_receivable_customers_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE receivable_customers ADD CONSTRAINT fk_receivable_customers_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE receivable_customers ADD CONSTRAINT fk_receivable_customers_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Payable Customers
ALTER TABLE payable_customers ADD CONSTRAINT fk_payable_customers_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE payable_customers ADD CONSTRAINT fk_payable_customers_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payable_customers ADD CONSTRAINT fk_payable_customers_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Receivable Debts
ALTER TABLE receivable_debts ADD CONSTRAINT fk_receivable_debts_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE receivable_debts ADD CONSTRAINT fk_receivable_debts_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE receivable_debts ADD CONSTRAINT fk_receivable_debts_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE receivable_debts ADD CONSTRAINT fk_receivable_debts_customer FOREIGN KEY (customer_id) REFERENCES receivable_customers(id) ON DELETE CASCADE;

-- Payable Debts
ALTER TABLE payable_debts ADD CONSTRAINT fk_payable_debts_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE payable_debts ADD CONSTRAINT fk_payable_debts_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payable_debts ADD CONSTRAINT fk_payable_debts_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payable_debts ADD CONSTRAINT fk_payable_debts_customer FOREIGN KEY (customer_id) REFERENCES payable_customers(id) ON DELETE CASCADE;

-- Receivable Payments
ALTER TABLE receivable_payments ADD CONSTRAINT fk_receivable_payments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE receivable_payments ADD CONSTRAINT fk_receivable_payments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE receivable_payments ADD CONSTRAINT fk_receivable_payments_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE receivable_payments ADD CONSTRAINT fk_receivable_payments_customer FOREIGN KEY (customer_id) REFERENCES receivable_customers(id) ON DELETE CASCADE;

-- Payable Payments
ALTER TABLE payable_payments ADD CONSTRAINT fk_payable_payments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE payable_payments ADD CONSTRAINT fk_payable_payments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payable_payments ADD CONSTRAINT fk_payable_payments_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payable_payments ADD CONSTRAINT fk_payable_payments_customer FOREIGN KEY (customer_id) REFERENCES payable_customers(id) ON DELETE CASCADE;

-- Refresh Tokens
ALTER TABLE refresh_tokens ADD CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
