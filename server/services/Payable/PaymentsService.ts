import { PaymentDto, UUID , SortItem, FilterItem} from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { PaymentRepository } from "../../repositories/PaymentRepository";

const repo = new PaymentRepository("payable");

export default class PayablePaymentsService {
	static async Create(payment: PaymentDto, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[PayablePayments] Creating payment", { companyId, customerId: payment.customer_id, userId });

			const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method, due_date } =
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

			const newPayment = await repo.create({
				customer_id,
				amount,
				currency,
				exchange_rate,
				invoice_no: invoice_no || null,
				description: description || null,
				payment_date,
				payment_method,
				due_date: due_date || null,
				company_id: companyId,
				created_by: userId,
			});

			Logger.info("[PayablePayments] Payment created successfully", { paymentId: newPayment.id, companyId });
			return ApiResponse.success(newPayment, "Payment created successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayablePayments] Error creating payment", { companyId, error: error.message });
			return ApiResponse.error("Error creating payment");
		}
	}

	static async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		try {
			Logger.debug("[PayablePayments] Fetching all payments", { companyId, page, limit, sorting, filters });

			const offset = page * limit;

			const result = await repo.findAllWithPagination(companyId, limit, offset, sorting, filters);

			Logger.debug("[PayablePayments] Payments fetched successfully", {
				companyId,
				count: result.rows.length,
				totalCount: result.count,
			});
			return ApiResponse.success({ rows: result.rows, count: result.count }, "Payments retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
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

			const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method, due_date } =
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

			const [affectedRows] = await repo.update(paymentId, companyId, {
				customer_id,
				amount,
				currency,
				exchange_rate,
				invoice_no: invoice_no || null,
				description: description || null,
				payment_date,
				payment_method,
				due_date: due_date || null,
			});

			if (affectedRows === 0) {
				const exists = await repo.findById(paymentId, companyId);
				if (!exists) {
					Logger.error("[PayablePayments] No payment found with provided ID", { paymentId, companyId });
					return ApiResponse.error("No payment found with the provided ID");
				}
			}

			Logger.info("[PayablePayments] Payment updated successfully", { paymentId, companyId });
			return ApiResponse.success(null, "Payment updated successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
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

			const deletedCount = await repo.delete(paymentId, companyId, userId);

			if (deletedCount === 0) {
				Logger.error("[PayablePayments] No payment found with given ID", { paymentId, companyId });
				return ApiResponse.error("No payment found with the given ID");
			}

			Logger.info("[PayablePayments] Payment deleted successfully", { paymentId, companyId });
			return ApiResponse.success(null, "Payment deleted successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayablePayments] Error deleting payment", { paymentId, companyId, error: error.message });
			return ApiResponse.error("Failed to delete payment");
		}
	}

	static async GetUpcomingChecks(companyId: string, daysThreshold: number = 7) {
		try {
			Logger.debug("[PayablePayments] Fetching upcoming checks", { companyId, daysThreshold });

			const result = await repo.getUpcomingChecks(companyId, daysThreshold);

			Logger.debug("[PayablePayments] Upcoming checks fetched", { companyId, count: result.length });
			return ApiResponse.success(result, "Upcoming checks retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayablePayments] Error fetching upcoming checks", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve upcoming checks");
		}
	}
}
