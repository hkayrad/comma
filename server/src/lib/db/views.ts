import { Sequelize } from "sequelize";
import { Logger } from "@/lib/utils/logger";

const views = [
  `CREATE OR REPLACE VIEW vw_receivable_debt_summary AS 
   SELECT customer_id, company_id, SUM((amount + vat - COALESCE(discount, 0) - COALESCE(withholding, 0)) * exchange_rate) AS total_debt 
   FROM receivable_debts 
   WHERE deleted_at IS NULL AND deleted_by IS NULL 
   GROUP BY customer_id, company_id;`,

  `CREATE OR REPLACE VIEW vw_receivable_payment_summary AS 
   SELECT customer_id, company_id, SUM(amount * exchange_rate) AS total_payments 
   FROM receivable_payments 
   WHERE deleted_at IS NULL AND deleted_by IS NULL 
   GROUP BY customer_id, company_id;`,

  `CREATE OR REPLACE VIEW vw_payable_debt_summary AS 
   SELECT customer_id, company_id, SUM((amount + vat - COALESCE(discount, 0) - COALESCE(withholding, 0)) * exchange_rate) AS total_debt 
   FROM payable_debts 
   WHERE deleted_at IS NULL AND deleted_by IS NULL 
   GROUP BY customer_id, company_id;`,

  `CREATE OR REPLACE VIEW vw_payable_payment_summary AS 
   SELECT customer_id, company_id, SUM(amount * exchange_rate) AS total_payments 
   FROM payable_payments 
   WHERE deleted_at IS NULL AND deleted_by IS NULL 
   GROUP BY customer_id, company_id;`
];

export async function recreateDatabaseViews(sequelize: Sequelize) {
  try {
    Logger.info("[DB] Recreating database views...");
    for (const viewSql of views) {
      await sequelize.query(viewSql);
    }
    Logger.info("[DB] Database views recreated successfully.");
  } catch (error) {
    Logger.error("[DB] Failed to recreate database views:", error);
    throw error;
  }
}
