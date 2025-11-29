import { InsertResult, PaymentDto, UUID } from "@common/types";
import { pool } from "../../lib/db/pool";
import { ApiResponse, Logger } from "../../lib/utils";

export default class ReceivablePaymentsService {
	static async Create(payment: PaymentDto, userId: UUID, companyId: UUID) {
		let conn;

		try {
			Logger.info("[ReceivablePayments] Creating payment", { companyId, customerId: payment.customer_id, userId });

			const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method } = payment;

			if (!customer_id || !amount || !currency || !exchange_rate || !payment_date || !payment_method) {
				Logger.error("[ReceivablePayments] Missing required fields", {
					customer_id,
					amount,
					currency,
					exchange_rate,
					payment_date,
					payment_method,
				});
				return ApiResponse.error("Missing required fields");
			}

			const query = `
                INSERT INTO receivable_payments (customer_id, amount, currency, exchange_rate, invoice_no, description, payment_date, payment_method, company_id, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
            `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				customer_id,
				amount,
				currency,
				exchange_rate,
				invoice_no || null,
				description || null,
				payment_date,
				payment_method,
				companyId,
				userId,
			])) as InsertResult[];

			Logger.debug("[ReceivablePayments] Payment creation result", { result });

			if (!result || result.length === 0) {
				Logger.error("[ReceivablePayments] Failed to create payment - no result returned");
				return ApiResponse.error("Failed to create payment");
			}

			Logger.info("[ReceivablePayments] Payment created successfully", { paymentId: result[0].id, companyId });
			return ApiResponse.success(result[0], "Payment created successfully");
		} catch (error: any) {
			Logger.error("[ReceivablePayments] Error creating payment", { companyId, error: error.message });
			return ApiResponse.error("Error creating payment");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetAll(companyId: UUID) {
		let conn;

		try {
			Logger.debug("[ReceivablePayments] Fetching all payments", { companyId });

			const query = `
        SELECT
            p.*,
            c.name AS customer_name,
            c.tax_number AS customer_tax_number
        FROM receivable_payments p
        JOIN receivable_customers c ON p.customer_id = c.id
        WHERE p.company_id = ? AND p.deleted_at IS NULL AND p.deleted_by IS NULL
        ORDER BY p.payment_date DESC
      `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [companyId])) as PaymentDto[];

			Logger.debug("[ReceivablePayments] Payments fetched successfully", { companyId, count: result.length });
			return ApiResponse.success(result, "Payments retrieved successfully");
		} catch (error: any) {
			Logger.error("[ReceivablePayments] Error fetching payments", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve payments");
		} finally {
			if (conn) conn.release();
		}
	}

	static async Update(paymentId: UUID, payment: PaymentDto, companyId: UUID) {
		let conn;

		try {
			Logger.info("[ReceivablePayments] Updating payment", { paymentId, companyId });

			if (!paymentId) {
				Logger.error("[ReceivablePayments] Missing payment ID");
				return ApiResponse.error("Missing payment ID");
			}

			const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method } = payment;

			if (!customer_id || !amount || !currency || !exchange_rate || !payment_date || !payment_method) {
				Logger.error("[ReceivablePayments] Missing required fields", {
					customer_id,
					amount,
					currency,
					exchange_rate,
					payment_date,
					payment_method,
				});
				return ApiResponse.error("Missing required fields");
			}

			const query = `
        UPDATE receivable_payments
        SET customer_id = ?, amount = ?, currency = ?, exchange_rate = ?, invoice_no = ?, description = ?, payment_date = ?, payment_method = ?
        WHERE id = ? AND company_id = ? AND deleted_at IS NULL AND deleted_by IS NULL
      `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				customer_id,
				amount,
				currency,
				exchange_rate,
				invoice_no || null,
				description || null,
				payment_date,
				payment_method,
				paymentId,
				companyId,
			])) as { affectedRows: number };

			Logger.debug("[ReceivablePayments] Payment update result", { paymentId, affectedRows: result.affectedRows });

			if (result.affectedRows === 0) {
				Logger.error("[ReceivablePayments] No payment found with provided ID", { paymentId, companyId });
				return ApiResponse.error("No payment found with the provided ID");
			}

			Logger.info("[ReceivablePayments] Payment updated successfully", { paymentId, companyId });
			return ApiResponse.success(null, "Payment updated successfully");
		} catch (error: any) {
			Logger.error("[ReceivablePayments] Error updating payment", { paymentId, companyId, error: error.message });
			return ApiResponse.error("Failed to update payment");
		} finally {
			if (conn) conn.release();
		}
	}

	static async Delete(paymentId: UUID, userId: UUID, companyId: UUID) {
		let conn;

		try {
			Logger.info("[ReceivablePayments] Deleting payment", { paymentId, companyId });

			if (!paymentId) {
				Logger.error("[ReceivablePayments] Missing payment ID");
				return ApiResponse.error("Missing payment ID");
			}

			const query = `
				UPDATE receivable_payments
				SET deleted_at = CURRENT_TIMESTAMP(), deleted_by = ?
				WHERE id = ? AND company_id = ? AND deleted_at IS NULL AND deleted_by IS NULL
			`;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [userId, paymentId, companyId])) as { affectedRows: number };

			Logger.debug("[ReceivablePayments] Payment deletion result", { paymentId, affectedRows: result.affectedRows });

			if (result.affectedRows === 0) {
				Logger.error("[ReceivablePayments] No payment found with given ID", { paymentId, companyId });
				return ApiResponse.error("No payment found with the given ID");
			}

			Logger.info("[ReceivablePayments] Payment deleted successfully", { paymentId, companyId });
			return ApiResponse.success(null, "Payment deleted successfully");
		} catch (error: any) {
			Logger.error("[ReceivablePayments] Error deleting payment", { paymentId, companyId, error: error.message });
			return ApiResponse.error("Failed to delete payment");
		} finally {
			if (conn) conn.release();
		}
	}
}
