import { InsertResult, PaymentDto, UUID } from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { ReceivablePayments } from "../../models";
import { sequelize } from "../../lib/db/sequelize";
import { QueryTypes } from "sequelize";

export default class ReceivablePaymentsService {
	static async Create(payment: PaymentDto, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[ReceivablePayments] Creating payment", { companyId, customerId: payment.customer_id, userId });

			const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method } =
				payment;

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

			const newPayment = await ReceivablePayments.create({
				customer_id,
				amount,
				currency,
				exchange_rate,
				invoice_no: invoice_no || null,
				description: description || null,
				payment_date,
				payment_method,
				company_id: companyId,
				created_by: userId,
			});

			Logger.info("[ReceivablePayments] Payment created successfully", { paymentId: newPayment.id, companyId });
			return ApiResponse.success(newPayment, "Payment created successfully");
		} catch (error: any) {
			Logger.error("[ReceivablePayments] Error creating payment", { companyId, error: error.message });
			return ApiResponse.error("Error creating payment");
		}
	}

	static async GetAll(companyId: UUID, page: number, limit: number) {
		try {
			Logger.debug("[ReceivablePayments] Fetching all payments", { companyId, page, limit });

			const offset = page * limit;

			const countQuery = `
				SELECT COUNT(*) as count
				FROM receivable_payments p
				WHERE p.company_id = ? AND p.deleted_at IS NULL AND p.deleted_by IS NULL
			`;

			const countResult = (await sequelize.query(countQuery, {
				replacements: [companyId],
				type: QueryTypes.SELECT,
			})) as { count: number }[];

			const totalCount = countResult[0]?.count || 0;

			const query = `
        SELECT
            p.*,
            c.name AS customer_name,
            c.tax_number AS customer_tax_number
        FROM receivable_payments p
        JOIN receivable_customers c ON p.customer_id = c.id
        WHERE p.company_id = ? AND p.deleted_at IS NULL AND p.deleted_by IS NULL
        ORDER BY p.payment_date DESC
				LIMIT ? OFFSET ?
      `;

			const result = (await sequelize.query(query, {
				replacements: [companyId, limit, offset],
				type: QueryTypes.SELECT,
			})) as PaymentDto[];

			Logger.debug("[ReceivablePayments] Payments fetched successfully", { companyId, count: result.length, totalCount });
			return ApiResponse.success({ rows: result, count: totalCount }, "Payments retrieved successfully");
		} catch (error: any) {
			Logger.error("[ReceivablePayments] Error fetching payments", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve payments");
		}
	}

	static async Update(paymentId: UUID, payment: PaymentDto, companyId: UUID) {
		try {
			Logger.info("[ReceivablePayments] Updating payment", { paymentId, companyId });

			if (!paymentId) {
				Logger.error("[ReceivablePayments] Missing payment ID");
				return ApiResponse.error("Missing payment ID");
			}

			const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method } =
				payment;

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

			const [affectedRows] = await ReceivablePayments.update(
				{
					customer_id,
					amount,
					currency,
					exchange_rate,
					invoice_no: invoice_no || null,
					description: description || null,
					payment_date,
					payment_method,
				},
				{
					where: { id: paymentId, company_id: companyId },
				}
			);

			if (affectedRows === 0) {
				const exists = await ReceivablePayments.findOne({ where: { id: paymentId, company_id: companyId } });
				if (!exists) {
					Logger.error("[ReceivablePayments] No payment found with provided ID", { paymentId, companyId });
					return ApiResponse.error("No payment found with the provided ID");
				}
			}

			Logger.info("[ReceivablePayments] Payment updated successfully", { paymentId, companyId });
			return ApiResponse.success(null, "Payment updated successfully");
		} catch (error: any) {
			Logger.error("[ReceivablePayments] Error updating payment", { paymentId, companyId, error: error.message });
			return ApiResponse.error("Failed to update payment");
		}
	}

	static async Delete(paymentId: UUID, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[ReceivablePayments] Deleting payment", { paymentId, companyId });

			if (!paymentId) {
				Logger.error("[ReceivablePayments] Missing payment ID");
				return ApiResponse.error("Missing payment ID");
			}

			await ReceivablePayments.update(
				{ deleted_by: userId },
				{ where: { id: paymentId, company_id: companyId } }
			);

			const deletedCount = await ReceivablePayments.destroy({
				where: { id: paymentId, company_id: companyId },
			});

			if (deletedCount === 0) {
				Logger.error("[ReceivablePayments] No payment found with given ID", { paymentId, companyId });
				return ApiResponse.error("No payment found with the given ID");
			}

			Logger.info("[ReceivablePayments] Payment deleted successfully", { paymentId, companyId });
			return ApiResponse.success(null, "Payment deleted successfully");
		} catch (error: any) {
			Logger.error("[ReceivablePayments] Error deleting payment", { paymentId, companyId, error: error.message });
			return ApiResponse.error("Failed to delete payment");
		}
	}
}
