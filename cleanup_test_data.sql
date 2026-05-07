-- Cleanup script for test company data (TO_DELETE_REPO and UNIQUE_REPO_CO_NAME_V4)

-- Delete related data first (using subqueries to find IDs associated with test companies)
DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE company_id IN (SELECT id FROM companies WHERE name IN ('TO_DELETE_REPO', 'UNIQUE_REPO_CO_NAME_V4')));
DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name IN ('TO_DELETE_REPO', 'UNIQUE_REPO_CO_NAME_V4'));
DELETE FROM payable_payments WHERE company_id IN (SELECT id FROM companies WHERE name IN ('TO_DELETE_REPO', 'UNIQUE_REPO_CO_NAME_V4'));
DELETE FROM payable_debts WHERE company_id IN (SELECT id FROM companies WHERE name IN ('TO_DELETE_REPO', 'UNIQUE_REPO_CO_NAME_V4'));
DELETE FROM payable_customers WHERE company_id IN (SELECT id FROM companies WHERE name IN ('TO_DELETE_REPO', 'UNIQUE_REPO_CO_NAME_V4'));
DELETE FROM receivable_payments WHERE company_id IN (SELECT id FROM companies WHERE name IN ('TO_DELETE_REPO', 'UNIQUE_REPO_CO_NAME_V4'));
DELETE FROM receivable_debts WHERE company_id IN (SELECT id FROM companies WHERE name IN ('TO_DELETE_REPO', 'UNIQUE_REPO_CO_NAME_V4'));
DELETE FROM receivable_customers WHERE company_id IN (SELECT id FROM companies WHERE name IN ('TO_DELETE_REPO', 'UNIQUE_REPO_CO_NAME_V4'));

-- Finally delete the companies themselves
DELETE FROM companies WHERE name IN ('TO_DELETE_REPO', 'UNIQUE_REPO_CO_NAME_V4', 'TEST_REPO_COMPANY_COMP');
