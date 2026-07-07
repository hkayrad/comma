import { Sequelize } from "sequelize";
import { Logger } from "@/lib/utils/logger";

const views = [
  `CREATE OR REPLACE VIEW vw_receivable_debt_summary AS 
   SELECT customer_id, company_id, SUM((amount + vat - COALESCE(discount, 0) - COALESCE(withholding, 0)) * exchange_rate) AS total_debt 
   FROM receivable_debts 
   WHERE deleted_at IS NULL AND deleted_by IS NULL 
   GROUP BY customer_id, company_id;`,

  `CREATE OR REPLACE VIEW vw_receivable_total_debt_by_company AS 
   SELECT d.company_id, 
          COALESCE(SUM(d.amount + d.vat - COALESCE(d.discount, 0) - COALESCE(d.withholding, 0)), 0) AS total, 
          COALESCE(SUM((d.amount + d.vat - COALESCE(d.discount, 0) - COALESCE(d.withholding, 0)) * d.exchange_rate), 0) AS total_in_try 
   FROM receivable_debts d 
   JOIN receivable_customers c ON d.customer_id = c.id AND d.company_id = c.company_id 
   WHERE d.deleted_at IS NULL AND d.deleted_by IS NULL AND c.deleted_at IS NULL AND c.deleted_by IS NULL 
   GROUP BY d.company_id;`,

  `CREATE OR REPLACE VIEW vw_payable_debt_summary AS 
   SELECT customer_id, company_id, SUM((amount + vat - COALESCE(discount, 0) - COALESCE(withholding, 0)) * exchange_rate) AS total_debt 
   FROM payable_debts 
   WHERE deleted_at IS NULL AND deleted_by IS NULL 
   GROUP BY customer_id, company_id;`,

  `CREATE OR REPLACE VIEW vw_payable_total_debt_by_company AS 
   SELECT d.company_id, 
          COALESCE(SUM(d.amount + d.vat - COALESCE(d.discount, 0) - COALESCE(d.withholding, 0)), 0) AS total, 
          COALESCE(SUM((d.amount + d.vat - COALESCE(d.discount, 0) - COALESCE(d.withholding, 0)) * d.exchange_rate), 0) AS total_in_try 
   FROM payable_debts d 
   JOIN payable_customers c ON d.customer_id = c.id AND d.company_id = c.company_id 
   WHERE d.deleted_at IS NULL AND d.deleted_by IS NULL AND c.deleted_at IS NULL AND c.deleted_by IS NULL 
   GROUP BY d.company_id;`
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
