import { DebtDto, InsertResult, Totals, UUID } from "@common/types";
import { pool } from "../../lib/db/pool";
import { ApiResponse, Logger } from "../../lib/utils";

export default class PayableDebtsService {
	static async Create(debt: DebtDto, companyId: UUID) {
		let conn;

		try {
			Logger.info("[PayableDebts] Creating debt", { companyId, customerId: debt.customer_id });

			const { customer_id, amount, vat, currency, issue_date, invoice_no, description } = debt;

			if (
				!customer_id ||
				amount === undefined ||
				amount === null ||
				!issue_date ||
				vat === undefined ||
				vat === null ||
				!currency
			) {
				Logger.error("[PayableDebts] Missing required fields", { customer_id, amount, vat, issue_date, currency });
				return ApiResponse.error("Customer, amount, issue date, VAT, and currency are required");
			}

			const query = `
                INSERT INTO payable_debts (customer_id, amount, vat, currency, issue_date, invoice_no, description, company_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
            `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				customer_id,
				amount,
				vat,
				currency,
				issue_date,
				invoice_no || null,
				description || null,
				companyId,
			])) as InsertResult[];

			Logger.debug("[PayableDebts] Debt creation result", { result });

			if (!result || result.length === 0) {
				Logger.error("[PayableDebts] Failed to create debt - no result returned");
				return ApiResponse.error("Failed to create debt");
			}

			Logger.info("[PayableDebts] Debt created successfully", { debtId: result[0].id, companyId });
			return ApiResponse.success(result[0].id, "Debt created successfully");
		} catch (error: any) {
			Logger.error("[PayableDebts] Error creating debt", { companyId, error: error.message });
			return ApiResponse.error("Failed to create debt");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetAll(companyId: UUID) {
		let conn;

		try {
			Logger.debug("[PayableDebts] Fetching all debts", { companyId });

			const query = `
                SELECT
                    d.*,
                    (d.amount + d.vat) AS total_amount,
                    c.name AS customer_name,
                    c.tax_number AS customer_tax_number
                FROM payable_debts d
                JOIN payable_customers c ON d.customer_id = c.id
                WHERE d.company_id = ?
                ORDER BY d.issue_date DESC
            `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [companyId])) as DebtDto[];

			Logger.debug("[PayableDebts] Debts fetched successfully", { companyId, count: result.length });
			return ApiResponse.success(result, "Debts retrieved successfully");
		} catch (error: any) {
			Logger.error("[PayableDebts] Error fetching debts", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve debts");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetTotals(companyId: UUID, currency: UUID) {
		let conn;

		try {
			Logger.debug("[PayableDebts] Fetching totals", { companyId, currency });

			const query = `
                SELECT
                    COALESCE((SELECT SUM(amount + vat) FROM payable_debts WHERE company_id = ? AND currency = ?), 0) AS total_debts,
                    COALESCE((SELECT SUM(amount) FROM payable_payments WHERE company_id = ? AND currency = ?), 0) AS total_payments,
                    COALESCE((COALESCE((SELECT SUM(amount + vat) FROM payable_debts WHERE company_id = ? AND currency = ?), 0) - COALESCE((SELECT SUM(amount) FROM payable_payments WHERE company_id = ? AND currency = ?), 0)), 0) AS remaining_debt
            `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [
				companyId,
				currency,
				companyId,
				currency,
				companyId,
				currency,
				companyId,
				currency,
			])) as Totals[];

			Logger.debug("[PayableDebts] Totals fetched successfully", { companyId, currency, totals: result[0] });

			if (result.length === 0) {
				Logger.error("[PayableDebts] No debt data found", { companyId, currency });
				return ApiResponse.error("No debt data found");
			}

			return ApiResponse.success(result[0], "Total debt retrieved successfully");
		} catch (error: any) {
			Logger.error("[PayableDebts] Error fetching totals", { companyId, currency, error: error.message });
			return ApiResponse.error("Failed to retrieve total debt");
		} finally {
			if (conn) conn.release();
		}
	}

	static async Update(id: UUID, debt: DebtDto, companyId: UUID) {
		let conn;

		try {
			Logger.info("[PayableDebts] Updating debt", { debtId: id, companyId });

			if (!id) {
				Logger.error("[PayableDebts] Missing debt ID");
				return ApiResponse.error("Debt ID is required");
			}

			const { customer_id, amount, vat, currency, issue_date, invoice_no, description } = debt;

			if (
				!customer_id ||
				amount === undefined ||
				amount === null ||
				!issue_date ||
				vat === undefined ||
				vat === null ||
				!currency
			) {
				Logger.error("[PayableDebts] Missing required fields", { customer_id, amount, vat, issue_date, currency });
				return ApiResponse.error("Customer, amount, issue date, VAT, and currency are required");
			}

			const query = `
                UPDATE payable_debts
                SET customer_id = ?, amount = ?, vat = ?, currency = ?, issue_date = ?, invoice_no = ?, description = ?
                WHERE id = ? AND company_id = ?
            `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				customer_id,
				amount,
				vat,
				currency,
				issue_date,
				invoice_no || null,
				description || null,
				id,
				companyId,
			])) as { affectedRows: number };

			Logger.debug("[PayableDebts] Debt update result", { debtId: id, affectedRows: result.affectedRows });

			if (result.affectedRows === 0) {
				Logger.error("[PayableDebts] No debt found with provided ID", { debtId: id, companyId });
				return ApiResponse.error("No debt found with the provided ID");
			}

			Logger.info("[PayableDebts] Debt updated successfully", { debtId: id, companyId });
			return ApiResponse.success(null, "Debt updated successfully");
		} catch (error: any) {
			Logger.error("[PayableDebts] Error updating debt", { debtId: id, companyId, error: error.message });
			return ApiResponse.error("Failed to update debt");
		} finally {
			if (conn) conn.release();
		}
	}

	static async Delete(id: UUID, companyId: UUID) {
		let conn;

		try {
			Logger.info("[PayableDebts] Deleting debt", { debtId: id, companyId });

			if (!id) {
				Logger.error("[PayableDebts] Missing debt ID");
				return ApiResponse.error("Debt ID is required");
			}

			const query = `
                DELETE FROM payable_debts WHERE id = ? AND company_id = ?
            `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [id, companyId])) as { affectedRows: number };

			Logger.debug("[PayableDebts] Debt deletion result", { debtId: id, affectedRows: result.affectedRows });

			if (result.affectedRows === 0) {
				Logger.error("[PayableDebts] No debt found with provided ID", { debtId: id, companyId });
				return ApiResponse.error("No debt found with the provided ID");
			}

			Logger.info("[PayableDebts] Debt deleted successfully", { debtId: id, companyId });
			return ApiResponse.success(null, "Debt deleted successfully");
		} catch (error: any) {
			Logger.error("[PayableDebts] Error deleting debt", { debtId: id, companyId, error: error.message });
			return ApiResponse.error("Failed to delete debt");
		} finally {
			if (conn) conn.release();
		}
	}
}
