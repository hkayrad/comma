import { DebtDto, UUID, SortItem, FilterItem } from "@common/types";
import { Logger } from "@/lib/utils/logger";
import { DebtRepository } from "@/repositories/DebtRepository";
import { NotFoundError, ValidationError } from "@/lib/errors/AppError";

const repo = new DebtRepository("receivable");

export default class ReceivableDebtsService {
	static async Create(debt: DebtDto, userId: UUID, companyId: UUID) {
		Logger.info("[ReceivableDebts] Creating debt", { companyId, customerId: debt.customer_id, userId });

		const { customer_id, amount, discount, vat, withholding, currency, exchange_rate, issue_date, due_date, invoice_no, description } = debt;

		if (!customer_id || amount === undefined || amount === null || !issue_date || vat === undefined || vat === null || !currency || !exchange_rate) {
			throw new ValidationError("Customer, amount, issue date, VAT, currency, and exchange rate are required");
		}

		const newDebt = await repo.create({
			customer_id, amount, discount, vat, withholding, currency, exchange_rate, issue_date,
			due_date: due_date || null, invoice_no: invoice_no || null, description: description || null,
			company_id: companyId, created_by: userId,
		});

		Logger.info("[ReceivableDebts] Debt created successfully", { debtId: newDebt.id, companyId });
		return newDebt.id;
	}

	static async GetAll(companyId: string, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		Logger.debug("[ReceivableDebts] Fetching all debts", { companyId, page, limit });
		const offset = page * limit;
		const repoResult = await repo.findAllWithSummary(companyId, limit, offset, sorting, filters);
		Logger.debug("[ReceivableDebts] Debts fetched successfully", { companyId, count: repoResult.rows.length, totalCount: repoResult.count });
		return { rows: repoResult.rows, count: repoResult.count };
	}

	static async GetTotals(companyId: string, currency: string) {
		Logger.debug("[ReceivableDebts] Fetching totals", { companyId, currency });
		const totals = await repo.getTotals(companyId, currency);
		if (!totals) {
			throw new NotFoundError("No debt data found");
		}
		Logger.debug("[ReceivableDebts] Totals fetched successfully", { companyId, currency });
		return totals;
	}

	static async Update(id: UUID, debt: DebtDto, companyId: UUID) {
		Logger.info("[ReceivableDebts] Updating debt", { debtId: id, companyId });
		if (!id) throw new ValidationError("Debt ID is required");

		const { customer_id, amount, discount, vat, withholding, currency, exchange_rate, issue_date, due_date, invoice_no, description } = debt;
		if (!customer_id || amount === undefined || amount === null || !issue_date || vat === undefined || vat === null || !currency || !exchange_rate) {
			throw new ValidationError("Customer, amount, issue date, VAT, currency, and exchange rate are required");
		}

		const [affectedRows] = await repo.update(id, companyId, {
			customer_id, amount, discount, vat, withholding, currency, exchange_rate, issue_date,
			due_date: due_date || null, invoice_no: invoice_no || null, description: description || null,
		});

		if (affectedRows === 0) {
			const exists = await repo.findById(id, companyId);
			if (!exists) throw new NotFoundError("No debt found with the provided ID");
		}
		Logger.info("[ReceivableDebts] Debt updated successfully", { debtId: id, companyId });
	}

	static async Delete(id: UUID, userId: UUID, companyId: UUID) {
		Logger.info("[ReceivableDebts] Deleting debt", { debtId: id, companyId });
		if (!id) throw new ValidationError("Debt ID is required");

		const deletedCount = await repo.delete(id, companyId, userId);
		if (deletedCount === 0) throw new NotFoundError("No debt found with the provided ID");
		Logger.info("[ReceivableDebts] Debt deleted successfully", { debtId: id, companyId });
	}

	static async GetUpcomingDueDates(companyId: string, daysThreshold: number = 7) {
		Logger.debug("[ReceivableDebts] Fetching upcoming due dates", { companyId, daysThreshold });
		const result = await repo.getUpcomingDueDates(companyId, daysThreshold);
		Logger.debug("[ReceivableDebts] Upcoming due dates fetched", { companyId, count: result.length });
		return result;
	}
}
