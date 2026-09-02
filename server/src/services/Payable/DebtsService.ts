import { BaseDebtService } from "../Generic/BaseDebtService";
import type { DebtDto, UUID, SortItem, FilterItem } from "@comma/common/types";

const service = new BaseDebtService("payable");

export default class PayableDebtsService {
	static async Create(debt: DebtDto, userId: UUID, companyId: UUID) {
		return service.Create(debt, userId, companyId);
	}

	static async CreateBatch(debts: DebtDto[], userId: UUID, companyId: UUID) {
		return service.CreateBatch(debts, userId, companyId);
	}

	static async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		return service.GetAll(companyId, page, limit, sorting, filters);
	}

	static async GetTotals(companyId: UUID, currency: string) {
		return service.GetTotals(companyId, currency);
	}

	static async Update(id: UUID, debt: DebtDto, companyId: UUID) {
		return service.Update(id, debt, companyId);
	}

	static async Delete(id: UUID, userId: UUID, companyId: UUID) {
		return service.Delete(id, userId, companyId);
	}

	static async DeleteBatch(ids: UUID[], userId: UUID, companyId: UUID) {
		return service.DeleteBatch(ids, userId, companyId);
	}

	static async Restore(id: UUID, userId: UUID, companyId: UUID) {
		return service.Restore(id, userId, companyId);
	}

	static async GetUpcomingDueDates(companyId: string, daysThreshold: number = 7) {
		return service.GetUpcomingDueDates(companyId, daysThreshold);
	}
}
