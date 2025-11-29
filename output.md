-- Add exchange_rate, total, and total_in_try to payable_debts
ALTER TABLE `payable_debts`
ADD COLUMN `exchange_rate` float UNSIGNED NOT NULL DEFAULT 1,
ADD COLUMN `total` decimal(16,2) GENERATED ALWAYS AS (`amount` + `vat`) VIRTUAL,
ADD COLUMN `total_in_try` decimal(16,2) GENERATED ALWAYS AS ((`amount` + `vat`) * `exchange_rate`) VIRTUAL;

-- Add exchange_rate and amount_in_try to payable_payments
ALTER TABLE `payable_payments`
ADD COLUMN `exchange_rate` float UNSIGNED NOT NULL DEFAULT 1,
ADD COLUMN `amount_in_try` decimal(16,2) GENERATED ALWAYS AS (`amount` * `exchange_rate`) VIRTUAL,
MODIFY `created_by` varchar(36) DEFAULT NULL;

-- Add exchange_rate, total, and total_in_try to receivable_debts
ALTER TABLE `receivable_debts`
ADD COLUMN `exchange_rate` float UNSIGNED NOT NULL DEFAULT 1,
ADD COLUMN `total` decimal(16,2) GENERATED ALWAYS AS (`amount` + `vat`) VIRTUAL,
ADD COLUMN `total_in_try` decimal(16,2) GENERATED ALWAYS AS ((`amount` + `vat`) * `exchange_rate`) VIRTUAL,
MODIFY `created_by` varchar(36) DEFAULT NULL;

-- Add exchange_rate and amount_in_try to receivable_payments
ALTER TABLE `receivable_payments`
ADD COLUMN `exchange_rate` float UNSIGNED NOT NULL DEFAULT 1,
ADD COLUMN `amount_in_try` decimal(16,2) GENERATED ALWAYS AS (`amount` * `exchange_rate`) VIRTUAL,
MODIFY `created_by` varchar(36) DEFAULT NULL;

-- Add updated_at to users
ALTER TABLE `users`
ADD COLUMN `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp();
