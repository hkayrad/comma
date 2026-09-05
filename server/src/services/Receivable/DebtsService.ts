import { BaseDebtService } from "../Generic/BaseDebtService";
import type { DebtDto, UUID, SortItem, FilterItem } from "@comma/common/types";

const service = new BaseDebtService("receivable");

export default class ReceivableDebtsService {
	static Create = (debt: DebtDto, userId: UUID, companyId: UUID) => service.Create(debt, userId, companyId);
	static CreateBatch = (debts: DebtDto[], userId: UUID, companyId: UUID) => service.CreateBatch(debts, userId, companyId);
	static GetAll = (companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) => service.GetAll(companyId, page, limit, sorting, filters);
	static GetTotals = (companyId: UUID, currency: string) => service.GetTotals(companyId, currency);
	static Update = (id: UUID, debt: DebtDto, companyId: UUID) => service.Update(id, debt, companyId);
	static Delete = (id: UUID, userId: UUID, companyId: UUID) => service.Delete(id, userId, companyId);
	static DeleteBatch = (ids: UUID[], userId: UUID, companyId: UUID) => service.DeleteBatch(ids, userId, companyId);
	static Restore = (id: UUID, userId: UUID, companyId: UUID) => service.Restore(id, userId, companyId);
	static GetUpcomingDueDates = (companyId: string, daysThreshold: number = 7) => service.GetUpcomingDueDates(companyId, daysThreshold);
}
