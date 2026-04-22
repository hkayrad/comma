import type { PaymentDto, UUID, SortItem, FilterItem } from "@comma/common/types";
import { Logger } from "@/lib/utils/logger";
import { PaymentRepository } from "@/repositories/PaymentRepository";
import { NotFoundError, ValidationError } from "@/lib/errors/AppError";

const repo = new PaymentRepository("receivable");

export default class ReceivablePaymentsService {
	static async Create(payment: PaymentDto, userId: UUID, companyId: UUID) {
		Logger.info("[ReceivablePayments] Creating payment", { companyId, customerId: payment.customer_id, userId });

		const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method, due_date } = payment;

		if (!customer_id || !amount || !currency || !exchange_rate || !payment_date || !payment_method) {
			throw new ValidationError("Missing required fields");
		}

		const newPayment = await repo.create({
			customer_id, amount, currency, exchange_rate,
			invoice_no: invoice_no || null, description: description || null,
			payment_date, payment_method, due_date: due_date || null,
			company_id: companyId, created_by: userId,
		});

		Logger.info("[ReceivablePayments] Payment created successfully", { paymentId: newPayment.id, companyId });
		return newPayment;
	}

	static async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		Logger.debug("[ReceivablePayments] Fetching all payments", { companyId, page, limit });
		const offset = page * limit;
		const result = await repo.findAllWithPagination(companyId, limit, offset, sorting, filters);
		Logger.debug("[ReceivablePayments] Payments fetched successfully", { companyId, count: result.rows.length, totalCount: result.count });
		return { rows: result.rows, count: result.count };
	}

	static async Update(paymentId: UUID, payment: PaymentDto, companyId: UUID) {
		Logger.info("[ReceivablePayments] Updating payment", { paymentId, companyId });
		if (!paymentId) throw new ValidationError("Missing payment ID");

		const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method, due_date } = payment;
		if (!customer_id || !amount || !currency || !exchange_rate || !payment_date || !payment_method) {
			throw new ValidationError("Missing required fields");
		}

		const [affectedRows] = await repo.update(paymentId, companyId, {
			customer_id, amount, currency, exchange_rate,
			invoice_no: invoice_no || null, description: description || null,
			payment_date, payment_method, due_date: due_date || null,
		});

		if (affectedRows === 0) {
			const exists = await repo.findById(paymentId, companyId);
			if (!exists) throw new NotFoundError("No payment found with the provided ID");
		}
		Logger.info("[ReceivablePayments] Payment updated successfully", { paymentId, companyId });
	}

	static async Delete(paymentId: UUID, userId: UUID, companyId: UUID) {
		Logger.info("[ReceivablePayments] Deleting payment", { paymentId, companyId });
		if (!paymentId) throw new ValidationError("Missing payment ID");

		const deletedCount = await repo.delete(paymentId, companyId, userId);
		if (deletedCount === 0) throw new NotFoundError("No payment found with the given ID");
		Logger.info("[ReceivablePayments] Payment deleted successfully", { paymentId, companyId });
	}

	static async GetUpcomingChecks(companyId: string, daysThreshold: number = 7) {
		Logger.debug("[ReceivablePayments] Fetching upcoming checks", { companyId, daysThreshold });
		const result = await repo.getUpcomingChecks(companyId, daysThreshold);
		Logger.debug("[ReceivablePayments] Upcoming checks fetched", { companyId, count: result.length });
		return result;
	}
}
