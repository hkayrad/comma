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

-- Add due_date for check payments
ALTER TABLE receivable_payments ADD COLUMN due_date DATE DEFAULT NULL;
ALTER TABLE payable_payments ADD COLUMN due_date DATE DEFAULT NULL;

-- ---------------------------------------------------------
-- 4. VIEWS
-- ---------------------------------------------------------

-- Receivable Debt Summary
CREATE OR REPLACE VIEW vw_receivable_debt_summary AS 
SELECT customer_id, company_id, SUM((amount + vat) * exchange_rate) AS total_debt 
FROM receivable_debts 
WHERE deleted_at IS NULL AND deleted_by IS NULL 
GROUP BY customer_id, company_id;

-- Receivable Payment Summary
CREATE OR REPLACE VIEW vw_receivable_payment_summary AS 
SELECT customer_id, company_id, SUM(amount * exchange_rate) AS total_payments 
FROM receivable_payments 
WHERE deleted_at IS NULL AND deleted_by IS NULL 
GROUP BY customer_id, company_id;

-- Receivable Total Debt By Company
CREATE OR REPLACE VIEW vw_receivable_total_debt_by_company AS 
SELECT d.company_id, COALESCE(SUM(d.amount + d.vat), 0) AS total, COALESCE(SUM((d.amount + d.vat) * d.exchange_rate), 0) AS total_in_try 
FROM receivable_debts d 
JOIN receivable_customers c ON d.customer_id = c.id AND d.company_id = c.company_id 
WHERE d.deleted_at IS NULL AND d.deleted_by IS NULL AND c.deleted_at IS NULL AND c.deleted_by IS NULL 
GROUP BY d.company_id;

-- Receivable Total Payments By Company
CREATE OR REPLACE VIEW vw_receivable_total_payments_by_company AS 
SELECT p.company_id, COALESCE(SUM(p.amount), 0) AS total, COALESCE(SUM(p.amount * p.exchange_rate), 0) AS total_in_try 
FROM receivable_payments p 
JOIN receivable_customers c ON p.customer_id = c.id AND p.company_id = c.company_id 
WHERE p.deleted_at IS NULL AND p.deleted_by IS NULL AND c.deleted_at IS NULL AND c.deleted_by IS NULL 
GROUP BY p.company_id;

-- Payable Debt Summary
CREATE OR REPLACE VIEW vw_payable_debt_summary AS 
SELECT customer_id, company_id, SUM((amount + vat) * exchange_rate) AS total_debt 
FROM payable_debts 
WHERE deleted_at IS NULL AND deleted_by IS NULL 
GROUP BY customer_id, company_id;

-- Payable Payment Summary
CREATE OR REPLACE VIEW vw_payable_payment_summary AS 
SELECT customer_id, company_id, SUM(amount * exchange_rate) AS total_payments 
FROM payable_payments 
WHERE deleted_at IS NULL AND deleted_by IS NULL 
GROUP BY customer_id, company_id;

-- Payable Total Debt By Company
CREATE OR REPLACE VIEW vw_payable_total_debt_by_company AS 
SELECT d.company_id, COALESCE(SUM(d.amount + d.vat), 0) AS total, COALESCE(SUM((d.amount + d.vat) * d.exchange_rate), 0) AS total_in_try 
FROM payable_debts d 
JOIN payable_customers c ON d.customer_id = c.id AND d.company_id = c.company_id 
WHERE d.deleted_at IS NULL AND d.deleted_by IS NULL AND c.deleted_at IS NULL AND c.deleted_by IS NULL 
GROUP BY d.company_id;

-- Payable Total Payments By Company
CREATE OR REPLACE VIEW vw_payable_total_payments_by_company AS 
SELECT p.company_id, COALESCE(SUM(p.amount), 0) AS total, COALESCE(SUM(p.amount * p.exchange_rate), 0) AS total_in_try 
FROM payable_payments p 
JOIN payable_customers c ON p.customer_id = c.id AND p.company_id = c.company_id 
WHERE p.deleted_at IS NULL AND p.deleted_by IS NULL AND c.deleted_at IS NULL AND c.deleted_by IS NULL 
GROUP BY p.company_id;

-- Receivable Payment By Invoice
CREATE OR REPLACE VIEW vw_receivable_payment_by_invoice AS
SELECT 
    company_id, 
    customer_id,
    invoice_no, 
    COALESCE(SUM(amount * exchange_rate), 0) AS total_paid
FROM receivable_payments
WHERE deleted_at IS NULL AND deleted_by IS NULL
GROUP BY company_id, customer_id, invoice_no;

-- Payable Payment By Invoice
CREATE OR REPLACE VIEW vw_payable_payment_by_invoice AS
SELECT 
    company_id, 
    customer_id,
    invoice_no, 
    COALESCE(SUM(amount * exchange_rate), 0) AS total_paid
FROM payable_payments
WHERE deleted_at IS NULL AND deleted_by IS NULL
GROUP BY company_id, customer_id, invoice_no;

SET FOREIGN_KEY_CHECKS = 1;
