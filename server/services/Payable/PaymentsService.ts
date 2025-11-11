import { InsertResult, PaymentDto, UUID } from "@common/types";
import { pool } from "../../lib/db/pool";
import { ApiResponse, Logger } from "../../lib/utils";

export default class PayablePaymentsService {
	static async Create(payment: PaymentDto, companyId: UUID) {
		let conn;

		try {
			Logger.info("[PayablePayments] Creating payment", { companyId, customerId: payment.customer_id });

			const { customer_id, amount, currency, invoice_no, payment_date, description, payment_method } = payment;

			if (!customer_id || !amount || !currency || !payment_date || !payment_method) {
				Logger.error("[PayablePayments] Missing required fields", {
					customer_id,
					amount,
					currency,
					payment_date,
					payment_method,
				});
				return ApiResponse.error("Missing required fields");
			}

			const query = `
                INSERT INTO payable_payments (customer_id, amount, currency, invoice_no, description, payment_date, payment_method, company_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
            `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				customer_id,
				amount,
				currency,
				invoice_no || null,
				description || null,
				payment_date,
				payment_method,
				companyId,
			])) as InsertResult[];

			Logger.debug("[PayablePayments] Payment creation result", { result });

			if (!result || result.length === 0) {
				Logger.error("[PayablePayments] Failed to create payment - no result returned");
				return ApiResponse.error("Failed to create payment");
			}

			Logger.info("[PayablePayments] Payment created successfully", { paymentId: result[0].id, companyId });
			return ApiResponse.success(result[0], "Payment created successfully");
		} catch (error: any) {
			Logger.error("[PayablePayments] Error creating payment", { companyId, error: error.message });
			return ApiResponse.error("Error creating payment");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetAll(companyId: UUID) {
		let conn;

		try {
			Logger.debug("[PayablePayments] Fetching all payments", { companyId });

			const query = `
                SELECT
                    p.*,
                    c.name AS customer_name,
                    c.tax_number AS customer_tax_number
                FROM payable_payments p
                JOIN payable_customers c ON p.customer_id = c.id
                WHERE p.company_id = ?
                ORDER BY p.payment_date DESC
            `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [companyId])) as PaymentDto[];

			Logger.debug("[PayablePayments] Payments fetched successfully", { companyId, count: result.length });
			return ApiResponse.success(result, "Payments retrieved successfully");
		} catch (error: any) {
			Logger.error("[PayablePayments] Error fetching payments", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve payments");
		} finally {
			if (conn) conn.release();
		}
	}

	static async Update(paymentId: UUID, payment: PaymentDto, companyId: UUID) {
		let conn;

		try {
			Logger.info("[PayablePayments] Updating payment", { paymentId, companyId });

			if (!paymentId) {
				Logger.error("[PayablePayments] Missing payment ID");
				return ApiResponse.error("Missing payment ID");
			}

			const { customer_id, amount, currency, invoice_no, payment_date, description, payment_method } = payment;

			if (!customer_id || !amount || !currency || !payment_date || !payment_method) {
				Logger.error("[PayablePayments] Missing required fields", {
					customer_id,
					amount,
					currency,
					payment_date,
					payment_method,
				});
				return ApiResponse.error("Missing required fields");
			}

			const query = `
                UPDATE payable_payments
                SET customer_id = ?, amount = ?, currency = ?, invoice_no = ?, description = ?, payment_date = ?, payment_method = ?
                WHERE id = ? AND company_id = ?
            `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				customer_id,
				amount,
				currency,
				invoice_no || null,
				description || null,
				payment_date,
				payment_method,
				paymentId,
				companyId,
			])) as { affectedRows: number };

			Logger.debug("[PayablePayments] Payment update result", { paymentId, affectedRows: result.affectedRows });

			if (result.affectedRows === 0) {
				Logger.error("[PayablePayments] No payment found with provided ID", { paymentId, companyId });
				return ApiResponse.error("No payment found with the provided ID");
			}

			Logger.info("[PayablePayments] Payment updated successfully", { paymentId, companyId });
			return ApiResponse.success(null, "Payment updated successfully");
		} catch (error: any) {
			Logger.error("[PayablePayments] Error updating payment", { paymentId, companyId, error: error.message });
			return ApiResponse.error("Failed to update payment");
		} finally {
			if (conn) conn.release();
		}
	}

	static async Delete(paymentId: UUID, companyId: UUID) {
		let conn;

		try {
			Logger.info("[PayablePayments] Deleting payment", { paymentId, companyId });

			if (!paymentId) {
				Logger.error("[PayablePayments] Missing payment ID");
				return ApiResponse.error("Missing payment ID");
			}

			const query = `DELETE FROM payable_payments WHERE id = ? AND company_id = ?`;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [paymentId, companyId])) as { affectedRows: number };

			Logger.debug("[PayablePayments] Payment deletion result", { paymentId, affectedRows: result.affectedRows });

			if (result.affectedRows === 0) {
				Logger.error("[PayablePayments] No payment found with given ID", { paymentId, companyId });
				return ApiResponse.error("No payment found with the given ID");
			}

			Logger.info("[PayablePayments] Payment deleted successfully", { paymentId, companyId });
			return ApiResponse.success(null, "Payment deleted successfully");
		} catch (error: any) {
			Logger.error("[PayablePayments] Error deleting payment", { paymentId, companyId, error: error.message });
			return ApiResponse.error("Failed to delete payment");
		} finally {
			if (conn) conn.release();
		}
	}
}
