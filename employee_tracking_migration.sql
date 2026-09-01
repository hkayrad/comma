-- =============================================================================
-- Migration: Çalışan Takibi (Employee Tracking) Modülü Tabloları
-- Tarih: 2026-09-01
-- Veritabanı: MariaDB / MySQL
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 0. ŞİRKET AYARLARI: Mesai Saatleri Sütunları
-- -----------------------------------------------------------------------------
ALTER TABLE `companies` ADD COLUMN IF NOT EXISTS `work_start_time` VARCHAR(10) DEFAULT '08:30';
ALTER TABLE `companies` ADD COLUMN IF NOT EXISTS `work_end_time` VARCHAR(10) DEFAULT '18:00';
ALTER TABLE `employee_garnishments` ADD COLUMN IF NOT EXISTS `start_date` VARCHAR(10) DEFAULT NULL;


-- -----------------------------------------------------------------------------
-- 1. TABLO: employees (Çalışan Özlük, IBAN ve Taban Maaş Bilgileri)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `employees` (
  `id` CHAR(36) NOT NULL,
  `company_id` CHAR(36) NOT NULL,
  `tc_no` VARCHAR(11) DEFAULT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `title` VARCHAR(100) DEFAULT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `address` VARCHAR(500) DEFAULT NULL,
  `hire_date` DATE NOT NULL,
  `termination_date` DATE DEFAULT NULL,
  `iban` VARCHAR(34) DEFAULT NULL,
  `bank_name` VARCHAR(100) DEFAULT NULL,
  `base_salary` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `salary_currency` VARCHAR(10) NOT NULL DEFAULT 'TRY',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `deleted_by` CHAR(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_employees_company_id` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. TABLO: employee_advances (Avans Takibi)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `employee_advances` (
  `id` CHAR(36) NOT NULL,
  `company_id` CHAR(36) NOT NULL,
  `employee_id` CHAR(36) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `request_date` DATE NOT NULL,
  `payment_date` DATE DEFAULT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'DEDUCTED') NOT NULL DEFAULT 'APPROVED',
  `description` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `deleted_by` CHAR(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_advances_company_id` (`company_id`),
  KEY `idx_advances_employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. TABLO: employee_garnishments (İcra Takibi Dosyaları)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `employee_garnishments` (
  `id` CHAR(36) NOT NULL,
  `company_id` CHAR(36) NOT NULL,
  `employee_id` CHAR(36) NOT NULL,
  `file_no` VARCHAR(100) NOT NULL,
  `execution_office` VARCHAR(150) NOT NULL,
  `total_debt` DECIMAL(15, 2) NOT NULL,
  `deduction_type` ENUM('PERCENTAGE', 'FIXED') NOT NULL DEFAULT 'PERCENTAGE',
  `deduction_value` DECIMAL(15, 2) NOT NULL DEFAULT 25.00,
  `paid_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('ACTIVE', 'COMPLETED', 'PAUSED') NOT NULL DEFAULT 'ACTIVE',
  `notes` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `deleted_by` CHAR(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_garnishments_company_id` (`company_id`),
  KEY `idx_garnishments_employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. TABLO: employee_attendances (PDKS Giriş-Çıkış, Devamsızlık ve Fazla Mesai)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `employee_attendances` (
  `id` CHAR(36) NOT NULL,
  `company_id` CHAR(36) NOT NULL,
  `employee_id` CHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `check_in_time` VARCHAR(10) DEFAULT NULL,
  `check_out_time` VARCHAR(10) DEFAULT NULL,
  `status` ENUM('PRESENT', 'ABSENT_UNEXCUSED', 'ABSENT_EXCUSED', 'ANNUAL_LEAVE', 'SICK_LEAVE', 'UNPAID_LEAVE', 'HALF_DAY') NOT NULL DEFAULT 'PRESENT',
  `overtime_hours` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `overtime_multiplier` DECIMAL(4, 2) NOT NULL DEFAULT 1.50,
  `notes` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `deleted_by` CHAR(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_attendances_company_id` (`company_id`),
  KEY `idx_attendances_employee_id` (`employee_id`),
  KEY `idx_attendances_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TABLO: employee_payrolls (Bordro ve Maaş Hesaplama)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `employee_payrolls` (
  `id` CHAR(36) NOT NULL,
  `company_id` CHAR(36) NOT NULL,
  `employee_id` CHAR(36) NOT NULL,
  `period_year` INT NOT NULL,
  `period_month` INT NOT NULL,
  `base_salary` DECIMAL(15, 2) NOT NULL,
  `working_days` INT NOT NULL DEFAULT 30,
  `absent_days` INT NOT NULL DEFAULT 0,
  `absence_deduction` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `overtime_pay` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `bonus_pay` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `advance_deduction` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `garnishment_deduction` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `net_payable` DECIMAL(15, 2) NOT NULL,
  `payment_status` ENUM('DRAFT', 'APPROVED', 'PAID') NOT NULL DEFAULT 'DRAFT',
  `payment_date` DATE DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` CHAR(36) DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `deleted_by` CHAR(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payrolls_company_id` (`company_id`),
  KEY `idx_payrolls_employee_id` (`employee_id`),
  KEY `idx_payrolls_period` (`period_year`, `period_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. YABANCI ANAHTARLAR (FOREIGN KEYS) - Opsiyonel Bağlantılar
-- -----------------------------------------------------------------------------
ALTER TABLE `employee_advances` ADD CONSTRAINT `fk_advances_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;
ALTER TABLE `employee_garnishments` ADD CONSTRAINT `fk_garnishments_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;
ALTER TABLE `employee_attendances` ADD CONSTRAINT `fk_attendances_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;
ALTER TABLE `employee_payrolls` ADD CONSTRAINT `fk_payrolls_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
