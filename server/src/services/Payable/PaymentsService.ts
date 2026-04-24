import type { PaymentDto, UUID, SortItem, FilterItem } from "@comma/common/types";
import { Logger } from "@/lib/utils/logger";
import { PaymentRepository } from "@/repositories/PaymentRepository";
import { NotFoundError, ValidationError } from "@/lib/errors/AppError";
import { sequelize } from "@/lib/db/sequelize";

const repo = new PaymentRepository("payable");

export default class PayablePaymentsService {
	static async Create(payment: PaymentDto, userId: UUID, companyId: UUID) {
		Logger.info("[PayablePayments] Creating payment", { companyId, customerId: payment.customer_id, userId });

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

		Logger.info("[PayablePayments] Payment created successfully", { paymentId: newPayment.id, companyId });
		return newPayment;
	}

	static async CreateBatch(payments: PaymentDto[], userId: UUID, companyId: UUID) {
		Logger.info("[PayablePayments] Creating payments batch", { companyId, count: payments.length, userId });

		const batchData = payments.map((payment) => ({
			customer_id: payment.customer_id,
			amount: payment.amount,
			currency: payment.currency,
			exchange_rate: payment.exchange_rate,
			invoice_no: payment.invoice_no || null,
			description: payment.description || null,
			payment_date: payment.payment_date,
			payment_method: payment.payment_method,
			due_date: payment.due_date || null,
			company_id: companyId,
			created_by: userId,
		}));

		return await sequelize.transaction(async (t) => {
			const result = await repo.createBatch(batchData, t);
			Logger.info("[PayablePayments] Payments batch created successfully", { companyId, count: result.length });
			return result;
		});
	}

	static async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		Logger.debug("[PayablePayments] Fetching all payments", { companyId, page, limit });
		const offset = page * limit;
		const result = await repo.findAllWithPagination(companyId, limit, offset, sorting, filters);
		Logger.debug("[PayablePayments] Payments fetched successfully", { companyId, count: result.rows.length, totalCount: result.count });
		return { rows: result.rows, count: result.count };
	}

	static async Update(paymentId: UUID, payment: PaymentDto, companyId: UUID) {
		Logger.info("[PayablePayments] Updating payment", { paymentId, companyId });
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
		Logger.info("[PayablePayments] Payment updated successfully", { paymentId, companyId });
	}

	static async Delete(paymentId: UUID, userId: UUID, companyId: UUID) {
		Logger.info("[PayablePayments] Deleting payment", { paymentId, companyId });
		if (!paymentId) throw new ValidationError("Missing payment ID");

		const deletedCount = await repo.delete(paymentId, companyId, userId);
		if (deletedCount === 0) throw new NotFoundError("No payment found with the given ID");
		Logger.info("[PayablePayments] Payment deleted successfully", { paymentId, companyId });
	}

	static async Restore(paymentId: UUID, userId: UUID, companyId: UUID) {
		Logger.info("[PayablePayments] Restoring payment", { paymentId, companyId, userId });
		if (!paymentId) throw new ValidationError("Missing payment ID");

		const [affectedCount] = await repo.restore(paymentId, companyId);
		if (affectedCount === 0) throw new NotFoundError("No payment found with the given ID");
		Logger.info("[PayablePayments] Payment restored successfully", { paymentId, companyId });
	}

	static async GetUpcomingChecks(companyId: string, daysThreshold: number = 7) {
		Logger.debug("[PayablePayments] Fetching upcoming checks", { companyId, daysThreshold });
		const result = await repo.getUpcomingChecks(companyId, daysThreshold);
		Logger.debug("[PayablePayments] Upcoming checks fetched", { companyId, count: result.length });
		return result;
	}
}
