import { PaymentDto, UUID } from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { PayablePayments } from "../../models";
import { sequelize } from "../../lib/db/sequelize";
import { QueryTypes } from "sequelize";

export default class PayablePaymentsService {
	static async Create(payment: PaymentDto, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[PayablePayments] Creating payment", { companyId, customerId: payment.customer_id });

			const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method } =
				payment;

			if (!customer_id || !amount || !currency || !exchange_rate || !payment_date || !payment_method) {
				Logger.error("[PayablePayments] Missing required fields", {
					customer_id,
					amount,
					currency,
					payment_date,
					payment_method,
					exchange_rate,
				});
				return ApiResponse.error("Missing required fields");
			}

			const newPayment = await PayablePayments.create({
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

			Logger.info("[PayablePayments] Payment created successfully", { paymentId: newPayment.id, companyId });
			return ApiResponse.success(newPayment, "Payment created successfully");
		} catch (error: any) {
			Logger.error("[PayablePayments] Error creating payment", { companyId, error: error.message });
			return ApiResponse.error("Error creating payment");
		}
	}

	static async GetAll(companyId: UUID, page: number, limit: number, sorting: any[] = [], filters: any[] = []) {
		try {
			Logger.debug("[PayablePayments] Fetching all payments", { companyId, page, limit, sorting, filters });

			const offset = page * limit;

            const colMap: Record<string, string> = {
                "customer_name": "c.name",
                "amount": "p.amount",
                "currency": "p.currency",
                "exchange_rate": "p.exchange_rate",
                "payment_method": "p.payment_method",
                "payment_date": "p.payment_date",
                "invoice_no": "p.invoice_no",
                "description": "p.description",
                "amount_in_try": "p.amount_in_try"
            };

            let whereClause = "WHERE p.company_id = ? AND p.deleted_at IS NULL AND p.deleted_by IS NULL";
            const replacements: any[] = [companyId];

            if (filters && filters.length > 0) {
                filters.forEach((filter) => {
                    const { id, value } = filter;
                    const dbCol = colMap[id];
                    if (!dbCol) return;

                    if (Array.isArray(value) && value.length > 0) {
                        whereClause += ` AND ${dbCol} IN (?)`;
                        replacements.push(value);
                    } else if (typeof value === "string" && value.trim() !== "") {
                        whereClause += ` AND ${dbCol} LIKE ?`;
                        replacements.push(`%${value}%`);
                    }
                });
            }

            let orderClause = "ORDER BY p.payment_date DESC";
            if (sorting && sorting.length > 0) {
                const sortParts = sorting.map((sort) => {
                    const dbCol = colMap[sort.id];
                    if (!dbCol) return null;
                    return `${dbCol} ${sort.desc ? "DESC" : "ASC"}`;
                }).filter(Boolean);
                
                if (sortParts.length > 0) {
                    orderClause = `ORDER BY ${sortParts.join(", ")}`;
                }
            }

			const countQuery = `
				SELECT COUNT(*) as count
				FROM payable_payments p
                JOIN payable_customers c ON p.customer_id = c.id
				${whereClause}
			`;

			const countResult = (await sequelize.query(countQuery, {
				replacements,
				type: QueryTypes.SELECT,
			})) as { count: number }[];

			const totalCount = countResult[0]?.count || 0;

			const query = `
        SELECT
            p.*,
            c.name AS customer_name,
            c.tax_number AS customer_tax_number
        FROM payable_payments p
        JOIN payable_customers c ON p.customer_id = c.id
        ${whereClause}
        ${orderClause}
		LIMIT ? OFFSET ?
      `;

			const result = (await sequelize.query(query, {
				replacements: [...replacements, limit, offset],
				type: QueryTypes.SELECT,
			})) as PaymentDto[];

			Logger.debug("[PayablePayments] Payments fetched successfully", { companyId, count: result.length, totalCount });
			return ApiResponse.success({ rows: result, count: totalCount }, "Payments retrieved successfully");
		} catch (error: any) {
			Logger.error("[PayablePayments] Error fetching payments", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve payments");
		}
	}

	static async Update(paymentId: UUID, payment: PaymentDto, companyId: UUID) {
		try {
			Logger.info("[PayablePayments] Updating payment", { paymentId, companyId });

			if (!paymentId) {
				Logger.error("[PayablePayments] Missing payment ID");
				return ApiResponse.error("Missing payment ID");
			}

			const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method } =
				payment;

			if (!customer_id || !amount || !currency || !exchange_rate || !payment_date || !payment_method) {
				Logger.error("[PayablePayments] Missing required fields", {
					customer_id,
					amount,
					currency,
					exchange_rate,
					payment_date,
					payment_method,
				});
				return ApiResponse.error("Missing required fields");
			}

			const [affectedRows] = await PayablePayments.update(
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
				const exists = await PayablePayments.findOne({ where: { id: paymentId, company_id: companyId } });
				if (!exists) {
					Logger.error("[PayablePayments] No payment found with provided ID", { paymentId, companyId });
					return ApiResponse.error("No payment found with the provided ID");
				}
			}

			Logger.info("[PayablePayments] Payment updated successfully", { paymentId, companyId });
			return ApiResponse.success(null, "Payment updated successfully");
		} catch (error: any) {
			Logger.error("[PayablePayments] Error updating payment", { paymentId, companyId, error: error.message });
			return ApiResponse.error("Failed to update payment");
		}
	}

	static async Delete(paymentId: UUID, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[PayablePayments] Deleting payment", { paymentId, companyId });

			if (!paymentId) {
				Logger.error("[PayablePayments] Missing payment ID");
				return ApiResponse.error("Missing payment ID");
			}

			await PayablePayments.update(
				{ deleted_by: userId },
				{ where: { id: paymentId, company_id: companyId } }
			);

			const deletedCount = await PayablePayments.destroy({
				where: { id: paymentId, company_id: companyId },
			});

			if (deletedCount === 0) {
				Logger.error("[PayablePayments] No payment found with given ID", { paymentId, companyId });
				return ApiResponse.error("No payment found with the given ID");
			}

			Logger.info("[PayablePayments] Payment deleted successfully", { paymentId, companyId });
			return ApiResponse.success(null, "Payment deleted successfully");
		} catch (error: any) {
			Logger.error("[PayablePayments] Error deleting payment", { paymentId, companyId, error: error.message });
			return ApiResponse.error("Failed to delete payment");
		}
	}
}
