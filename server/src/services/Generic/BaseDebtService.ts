import type { DebtDto, UUID, SortItem, FilterItem } from "@comma/common/types";
import { Logger } from "@/lib/utils/logger";
import { DebtRepository, type DebtDomain } from "@/repositories/DebtRepository";
import { NotFoundError, ValidationError } from "@/lib/errors/AppError";
import { sequelize } from "@/lib/db/sequelize";

export class BaseDebtService {
	private repo: DebtRepository;
	private domainLabel: string;

	constructor(domain: DebtDomain) {
		this.repo = new DebtRepository(domain);
		this.domainLabel = domain === "receivable" ? "ReceivableDebts" : "PayableDebts";
	}

	async Create(debt: DebtDto, userId: UUID, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Creating debt`, { companyId, customerId: debt.customer_id, userId });

		const { customer_id, amount, discount, vat, withholding, currency, exchange_rate, issue_date, due_date, invoice_no, description } = debt;

		if (!customer_id || amount === undefined || amount === null || !issue_date || vat === undefined || vat === null || !currency || !exchange_rate) {
			throw new ValidationError("Customer, amount, issue date, VAT, currency, and exchange rate are required");
		}

		const newDebt = await this.repo.create({
			customer_id, amount, discount, vat, withholding, currency, exchange_rate, issue_date,
			due_date: due_date || null, invoice_no: invoice_no || null, description: description || null,
			company_id: companyId, created_by: userId,
		});

		Logger.info(`[${this.domainLabel}] Debt created successfully`, { debtId: newDebt.id, companyId });
		return newDebt.id;
	}

	async CreateBatch(debts: DebtDto[], userId: UUID, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Creating debts batch`, { companyId, count: debts.length, userId });

		const batchData = debts.map((debt) => ({
			customer_id: debt.customer_id,
			amount: debt.amount,
			discount: debt.discount || 0,
			vat: debt.vat,
			withholding: debt.withholding || 0,
			currency: debt.currency,
			exchange_rate: debt.exchange_rate,
			issue_date: debt.issue_date,
			due_date: debt.due_date || null,
			invoice_no: debt.invoice_no || null,
			description: debt.description || null,
			company_id: companyId,
			created_by: userId,
		}));

		return await sequelize.transaction(async (t) => {
			const result = await this.repo.createBatch(batchData, t);
			Logger.info(`[${this.domainLabel}] Debts batch created successfully`, { companyId, count: result.length });
			return result;
		});
	}

	async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		Logger.debug(`[${this.domainLabel}] Fetching all debts`, { companyId, page, limit });
		const offset = page * limit;
		const repoResult = await this.repo.findAllWithSummary(companyId, limit, offset, sorting, filters);
		Logger.debug(`[${this.domainLabel}] Debts fetched successfully`, { companyId, count: repoResult.rows.length, totalCount: repoResult.count });
		return { rows: repoResult.rows, count: repoResult.count };
	}

	async GetTotals(companyId: UUID, currency: string) {
		Logger.debug(`[${this.domainLabel}] Fetching totals`, { companyId, currency });
		const totals = await this.repo.getTotals(companyId, currency);
		if (!totals) {
			throw new NotFoundError("No debt data found");
		}
		Logger.debug(`[${this.domainLabel}] Totals fetched successfully`, { companyId, currency });
		return totals;
	}

	async Update(id: UUID, debt: DebtDto, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Updating debt`, { debtId: id, companyId });
		if (!id) throw new ValidationError("Debt ID is required");

		const { customer_id, amount, discount, vat, withholding, currency, exchange_rate, issue_date, due_date, invoice_no, description } = debt;
		if (!customer_id || amount === undefined || amount === null || !issue_date || vat === undefined || vat === null || !currency || !exchange_rate) {
			throw new ValidationError("Customer, amount, issue date, VAT, currency, and exchange rate are required");
		}

		const [affectedRows] = await this.repo.update(id, companyId, {
			customer_id, amount, discount, vat, withholding, currency, exchange_rate, issue_date,
			due_date: due_date || null, invoice_no: invoice_no || null, description: description || null,
		});

		if (affectedRows === 0) {
			const exists = await this.repo.findById(id, companyId);
			if (!exists) throw new NotFoundError("No debt found with the provided ID");
		}
		Logger.info(`[${this.domainLabel}] Debt updated successfully`, { debtId: id, companyId });
	}

	async Delete(id: UUID, userId: UUID, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Deleting debt`, { debtId: id, companyId });
		if (!id) throw new ValidationError("Debt ID is required");

		const deletedCount = await this.repo.delete(id, companyId, userId);
		if (deletedCount === 0) throw new NotFoundError("No debt found with the provided ID");
		Logger.info(`[${this.domainLabel}] Debt deleted successfully`, { debtId: id, companyId });
	}

	async DeleteBatch(ids: UUID[], userId: UUID, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Deleting debts batch`, { companyId, count: ids?.length, userId });
		if (!ids || ids.length === 0) throw new ValidationError("At least one debt ID is required");

		return await sequelize.transaction(async (t) => {
			const deletedCount = await this.repo.deleteBatch(ids, companyId, userId, t);
			Logger.info(`[${this.domainLabel}] Debts batch deleted successfully`, { companyId, count: deletedCount });
			return deletedCount;
		});
	}

	async Restore(id: UUID, userId: UUID, companyId: UUID) {
		Logger.info(`[${this.domainLabel}] Restoring debt`, { debtId: id, companyId, userId });
		if (!id) throw new ValidationError("Debt ID is required");

		const [affectedCount] = await this.repo.restore(id, companyId);
		if (affectedCount === 0) throw new NotFoundError("No debt found with the provided ID");
		Logger.info(`[${this.domainLabel}] Debt restored successfully`, { debtId: id, companyId });
	}

	async GetUpcomingDueDates(companyId: string, daysThreshold: number = 7) {
		Logger.debug(`[${this.domainLabel}] Fetching upcoming due dates`, { companyId, daysThreshold });
		const result = await this.repo.getUpcomingDueDates(companyId, daysThreshold);
		Logger.debug(`[${this.domainLabel}] Upcoming due dates fetched`, { companyId, count: result.length });
		return result;
	}
}
