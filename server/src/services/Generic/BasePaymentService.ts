import type { PaymentDto, UUID, SortItem, FilterItem } from "@comma/common/types";
import { Logger } from "@/lib/utils/logger";
import { PaymentRepository, type PaymentDomain } from "@/repositories/PaymentRepository";
import { NotFoundError, ValidationError } from "@/lib/errors/AppError";
import { sequelize } from "@/lib/db/sequelize";

export class BasePaymentService {
	private repo: PaymentRepository;
	private domainLabel: string;

	constructor(domain: PaymentDomain) {
		this.repo = new PaymentRepository(domain);
		this.domainLabel = domain === "receivable" ? "ReceivablePayments" : "PayablePayments";
	}

	async Create(payment: PaymentDto, userId: UUID, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Creating payment`, { companyId, customerId: payment.customer_id, userId });

		const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method, due_date } = payment;

		if (!customer_id || amount === undefined || amount === null || !currency || !exchange_rate || !payment_method) {
			throw new ValidationError("Customer, amount, currency, exchange rate, and payment method are required");
		}

		const newPayment = await this.repo.create({
			customer_id, amount, currency, exchange_rate,
			invoice_no: invoice_no || null,
			payment_date: payment_date ? new Date(payment_date) : new Date(),
			due_date: due_date ? new Date(due_date) : null,
			description: description || null, payment_method,
			company_id: companyId, created_by: userId,
		});

		Logger.info(`[${this.domainLabel}] Payment created successfully`, { paymentId: newPayment.id, companyId });
		return newPayment;
	}

	async CreateBatch(payments: PaymentDto[], userId: UUID, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Creating payments batch`, { companyId, count: payments.length, userId });

		const batchData = payments.map((payment) => ({
			customer_id: payment.customer_id,
			amount: payment.amount,
			currency: payment.currency,
			exchange_rate: payment.exchange_rate,
			invoice_no: payment.invoice_no || null,
			payment_date: payment.payment_date ? new Date(payment.payment_date) : new Date(),
			due_date: payment.due_date ? new Date(payment.due_date) : null,
			description: payment.description || null,
			payment_method: payment.payment_method,
			company_id: companyId,
			created_by: userId,
		}));

		return await sequelize.transaction(async (t) => {
			const result = await this.repo.createBatch(batchData, t);
			Logger.info(`[${this.domainLabel}] Payments batch created successfully`, { companyId, count: result.length });
			return result;
		});
	}

	async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		Logger.debug(`[${this.domainLabel}] Fetching all payments`, { companyId, page, limit });
		const offset = page * limit;
		const result = await this.repo.findAllWithPagination(companyId, limit, offset, sorting, filters);
		Logger.debug(`[${this.domainLabel}] Payments fetched successfully`, { companyId, count: result.rows.length, totalCount: result.count });
		return { rows: result.rows, count: result.count };
	}

	async Update(paymentId: UUID, payment: PaymentDto, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Updating payment`, { paymentId, companyId });
		if (!paymentId) throw new ValidationError("Missing payment ID");

		const { customer_id, amount, currency, exchange_rate, invoice_no, payment_date, description, payment_method, due_date } = payment;
		if (!customer_id || amount === undefined || amount === null || !currency || !exchange_rate || !payment_method) {
			throw new ValidationError("Customer, amount, currency, exchange rate, and payment method are required");
		}

		const [affectedRows] = await this.repo.update(paymentId, companyId, {
			customer_id, amount, currency, exchange_rate,
			invoice_no: invoice_no || null,
			payment_date: payment_date ? new Date(payment_date) : new Date(),
			due_date: due_date ? new Date(due_date) : null,
			description: description || null, payment_method,
		});

		if (affectedRows === 0) {
			const exists = await this.repo.findById(paymentId, companyId);
			if (!exists) throw new NotFoundError("No payment found with the provided ID");
		}
		Logger.info(`[${this.domainLabel}] Payment updated successfully`, { paymentId, companyId });
	}

	async Delete(paymentId: UUID, userId: UUID, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Deleting payment`, { paymentId, companyId });
		if (!paymentId) throw new ValidationError("Missing payment ID");

		const deletedCount = await this.repo.delete(paymentId, companyId, userId);
		if (deletedCount === 0) throw new NotFoundError("No payment found with the given ID");
		Logger.info(`[${this.domainLabel}] Payment deleted successfully`, { paymentId, companyId });
	}

	async DeleteBatch(ids: UUID[], userId: UUID, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Deleting payments batch`, { companyId, count: ids?.length, userId });
		if (!ids || ids.length === 0) throw new ValidationError("At least one payment ID is required");

		return await sequelize.transaction(async (t) => {
			const deletedCount = await this.repo.deleteBatch(ids, companyId, userId, t);
			Logger.info(`[${this.domainLabel}] Payments batch deleted successfully`, { companyId, count: deletedCount });
			return deletedCount;
		});
	}

	async Restore(paymentId: UUID, userId: UUID, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Restoring payment`, { paymentId, companyId, userId });
		if (!paymentId) throw new ValidationError("Missing payment ID");

		const [affectedCount] = await this.repo.restore(paymentId, companyId);
		if (affectedCount === 0) throw new NotFoundError("No payment found with the given ID");
		Logger.info(`[${this.domainLabel}] Payment restored successfully`, { paymentId, companyId });
	}

	async GetUpcomingChecks(companyId: string, daysThreshold: number = 7) {
		Logger.debug(`[${this.domainLabel}] Fetching upcoming checks`, { companyId, daysThreshold });
		const result = await this.repo.getUpcomingChecks(companyId, daysThreshold);
		Logger.debug(`[${this.domainLabel}] Upcoming checks fetched`, { companyId, count: result.length });
		return result;
	}
}
