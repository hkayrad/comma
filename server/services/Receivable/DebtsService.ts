import { DebtDto, InsertResult, Totals, UUID } from "@common/types";
import { pool } from "../../lib/db/pool";
import { ApiResponse, Logger } from "../../lib/utils";

export default class ReceivableDebtsService {
	static async Create(debt: DebtDto, userId: UUID, companyId: UUID) {
		let conn;

		try {
			Logger.info("[ReceivableDebts] Creating debt", { companyId, customerId: debt.customer_id, userId });

			const { customer_id, amount, vat, currency, exchange_rate, issue_date, invoice_no, description } = debt;

			if (
				!customer_id ||
				amount === undefined ||
				amount === null ||
				!issue_date ||
				vat === undefined ||
				vat === null ||
				!currency ||
				!exchange_rate
			) {
				Logger.error("[ReceivableDebts] Missing required fields", {
					customer_id,
					amount,
					vat,
					issue_date,
					currency,
					exchange_rate,
				});
				return ApiResponse.error("Customer, amount, issue date, VAT, currency, and exchange rate are required");
			}

			const query = `
				INSERT INTO receivable_debts (customer_id, amount, vat, currency, exchange_rate, issue_date, invoice_no, description, company_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
            `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				customer_id,
				amount,
				vat,
				currency,
				exchange_rate,
				issue_date,
				invoice_no || null,
				description || null,
				companyId,
				userId,
			])) as InsertResult[];

			Logger.debug("[ReceivableDebts] Debt creation result", { result });

			if (!result || result.length === 0) {
				Logger.error("[ReceivableDebts] Failed to create debt - no result returned");
				return ApiResponse.error("Failed to create debt");
			}

			Logger.info("[ReceivableDebts] Debt created successfully", { debtId: result[0].id, companyId });
			return ApiResponse.success(result[0].id, "Debt created successfully");
		} catch (error: any) {
			Logger.error("[ReceivableDebts] Error creating debt", { companyId, error: error.message });
			return ApiResponse.error("Failed to create debt");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetAll(companyId: string) {
		let conn;

		try {
			Logger.debug("[ReceivableDebts] Fetching all debts", { companyId });

			const query = `
				SELECT
			    d.*,
			    c.name AS customer_name,
			    c.tax_number AS customer_tax_number
				FROM receivable_debts d
				JOIN receivable_customers c ON d.customer_id = c.id AND c.company_id = d.company_id
				WHERE d.company_id = ?
			    AND d.deleted_at IS NULL
			    AND d.deleted_by IS NULL
			    AND c.deleted_at IS NULL
			    AND c.deleted_by IS NULL
				ORDER BY d.issue_date DESC;
            `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [companyId])) as DebtDto[];

			Logger.debug("[ReceivableDebts] Debts fetched successfully", { companyId, count: result.length });
			return ApiResponse.success(result, "Debts retrieved successfully");
		} catch (error: any) {
			Logger.error("[ReceivableDebts] Error fetching debts", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve debts");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetTotals(companyId: string, currency: string) {
		let conn;

		try {
			Logger.debug("[ReceivableDebts] Fetching totals", { companyId, currency });

			const query = `
				WITH debts_summary AS (
			    SELECT
						COALESCE(SUM(d.total), 0) AS total,
						COALESCE(SUM(d.total_in_try), 0) AS total_in_try
			    FROM receivable_debts d
			    INNER JOIN receivable_customers c ON d.customer_id = c.id AND d.company_id = c.company_id
			    WHERE d.company_id = ?
		        AND d.deleted_at IS NULL
		        AND d.deleted_by IS NULL
		        AND c.deleted_at IS NULL
		        AND c.deleted_by IS NULL
				),
				payments_summary AS (
		    	SELECT
						COALESCE(SUM(p.amount), 0) AS total,
						COALESCE(SUM(p.amount_in_try), 0) AS total_in_try
			    FROM receivable_payments p
			    INNER JOIN receivable_customers c ON p.customer_id = c.id AND p.company_id = c.company_id
			    WHERE p.company_id = ?
		        AND p.deleted_at IS NULL
		        AND p.deleted_by IS NULL
		        AND c.deleted_at IS NULL
		        AND c.deleted_by IS NULL
				)
				SELECT
			    debts_summary.total_in_try AS total_debts,
			    payments_summary.total_in_try AS total_payments,
			    debts_summary.total_in_try - payments_summary.total_in_try AS remaining_debt
				FROM
			    debts_summary,
			    payments_summary;
      `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [companyId, companyId])) as Totals[];

			Logger.debug("[ReceivableDebts] Totals fetched successfully", { companyId, currency, totals: result[0] });

			if (result.length === 0) {
				Logger.error("[ReceivableDebts] No debt data found", { companyId, currency });
				return ApiResponse.error("No debt data found");
			}

			return ApiResponse.success(result[0], "Total debt retrieved successfully");
		} catch (error: any) {
			Logger.error("[ReceivableDebts] Error fetching totals", { companyId, currency, error: error.message });
			return ApiResponse.error("Failed to retrieve total debt");
		} finally {
			if (conn) conn.release();
		}
	}

	static async Update(id: UUID, debt: DebtDto, companyId: UUID) {
		let conn;

		try {
			Logger.info("[ReceivableDebts] Updating debt", { debtId: id, companyId });

			if (!id) {
				Logger.error("[ReceivableDebts] Missing debt ID");
				return ApiResponse.error("Debt ID is required");
			}

			const { customer_id, amount, vat, currency, exchange_rate, issue_date, invoice_no, description } = debt;

			if (
				!customer_id ||
				amount === undefined ||
				amount === null ||
				!issue_date ||
				vat === undefined ||
				vat === null ||
				!currency ||
				!exchange_rate
			) {
				Logger.error("[ReceivableDebts] Missing required fields", { customer_id, amount, vat, issue_date, currency });
				return ApiResponse.error("Customer, amount, issue date, VAT, currency, and exchange rate are required");
			}

			const query = `
        UPDATE receivable_debts
        SET customer_id = ?, amount = ?, vat = ?, currency = ?, exchange_rate = ?, issue_date = ?, invoice_no = ?, description = ?
        WHERE id = ? AND company_id = ? AND deleted_at IS NULL AND deleted_by IS NULL
      `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				customer_id,
				amount,
				vat,
				currency,
				exchange_rate,
				issue_date,
				invoice_no || null,
				description || null,
				id,
				companyId,
			])) as { affectedRows: number };

			Logger.debug("[ReceivableDebts] Debt update result", { debtId: id, affectedRows: result.affectedRows });

			if (result.affectedRows === 0) {
				Logger.error("[ReceivableDebts] No debt found with provided ID", { debtId: id, companyId });
				return ApiResponse.error("No debt found with the provided ID");
			}

			Logger.info("[ReceivableDebts] Debt updated successfully", { debtId: id, companyId });
			return ApiResponse.success(null, "Debt updated successfully");
		} catch (error: any) {
			Logger.error("[ReceivableDebts] Error updating debt", { debtId: id, companyId, error: error.message });
			return ApiResponse.error("Failed to update debt");
		} finally {
			if (conn) conn.release();
		}
	}

	static async Delete(id: UUID, userId: UUID, companyId: UUID) {
		let conn;

		try {
			Logger.info("[ReceivableDebts] Deleting debt", { debtId: id, companyId });

			if (!id) {
				Logger.error("[ReceivableDebts] Missing debt ID");
				return ApiResponse.error("Debt ID is required");
			}

			const query = `
				UPDATE receivable_debts
        SET deleted_at = CURRENT_TIMESTAMP(), deleted_by = ?
        WHERE id = ? AND company_id = ? AND deleted_at IS NULL AND deleted_by IS NULL
      `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [userId, id, companyId])) as { affectedRows: number };

			Logger.debug("[ReceivableDebts] Debt deletion result", { debtId: id, affectedRows: result.affectedRows });

			if (result.affectedRows === 0) {
				Logger.error("[ReceivableDebts] No debt found with provided ID", { debtId: id, companyId });
				return ApiResponse.error("No debt found with the provided ID");
			}

			Logger.info("[ReceivableDebts] Debt deleted successfully", { debtId: id, companyId });
			return ApiResponse.success(null, "Debt deleted successfully");
		} catch (error: any) {
			Logger.error("[ReceivableDebts] Error deleting debt", { debtId: id, companyId, error: error.message });
			return ApiResponse.error("Failed to delete debt");
		} finally {
			if (conn) conn.release();
		}
	}
}
