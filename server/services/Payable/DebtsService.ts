import { DebtDto, UUID , SortItem, FilterItem} from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { DebtRepository } from "../../repositories/DebtRepository";

const repo = new DebtRepository("payable");

export default class PayableDebtsService {
	static async Create(debt: DebtDto, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[PayableDebts] Creating debt", { companyId, customerId: debt.customer_id, userId });

			const {
				customer_id,
				amount,
				discount,
				vat,
				withholding,
				currency,
				exchange_rate,
				issue_date,
				due_date,
				invoice_no,
				description,
			} = debt;

			if (
				!customer_id ||
				amount === undefined ||
				amount === null ||
				!issue_date ||
				vat === undefined ||
				vat === null ||
				!currency ||
				!exchange_rate
			) {
				Logger.error("[PayableDebts] Missing required fields", { customer_id, amount, vat, issue_date, currency });
				return ApiResponse.error("Customer, amount, issue date, VAT, currency, exchange rate are required");
			}

			const newDebt = await repo.create({
				customer_id,
				amount,
				discount,
				vat,
				withholding,
				currency,
				exchange_rate,
				issue_date,
				due_date: due_date || null,
				invoice_no: invoice_no || null,
				description: description || null,
				company_id: companyId,
				created_by: userId,
			});

			Logger.info("[PayableDebts] Debt created successfully", { debtId: newDebt.id, companyId });
			return ApiResponse.success(newDebt.id, "Debt created successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableDebts] Error creating debt", { companyId, error: error.message });
			return ApiResponse.error("Failed to create debt");
		}
	}

	static async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		try {
			Logger.debug("[PayableDebts] Fetching all debts", { companyId, page, limit, sorting, filters });

			const offset = page * limit;
            const repoResult = await repo.findAllWithSummary(companyId, limit, offset, sorting, filters);

			Logger.debug("[PayableDebts] Debts fetched successfully", { companyId, count: repoResult.rows.length, totalCount: repoResult.count });
			return ApiResponse.success({ rows: repoResult.rows, count: repoResult.count }, "Debts retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableDebts] Error fetching debts", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve debts");
		}
	}

	static async GetTotals(companyId: UUID, currency: UUID) {
		try {
			Logger.debug("[PayableDebts] Fetching totals", { companyId, currency });

            const totals = await repo.getTotals(companyId, currency);
			Logger.debug("[PayableDebts] Totals fetched successfully", { companyId, currency, totals });

			if (!totals) {
				Logger.error("[PayableDebts] No debt data found", { companyId, currency });
				return ApiResponse.error("No debt data found");
			}

			return ApiResponse.success(totals, "Total debt retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableDebts] Error fetching totals", { companyId, currency, error: error.message });
			return ApiResponse.error("Failed to retrieve total debt");
		}
	}

	static async Update(id: UUID, debt: DebtDto, companyId: UUID) {
		try {
			Logger.info("[PayableDebts] Updating debt", { debtId: id, companyId });

			if (!id) {
				Logger.error("[PayableDebts] Missing debt ID");
				return ApiResponse.error("Debt ID is required");
			}

			const {
				customer_id,
				amount,
				discount,
				vat,
				withholding,
				currency,
				exchange_rate,
				issue_date,
				due_date,
				invoice_no,
				description,
			} = debt;

			if (
				!customer_id ||
				amount === undefined ||
				amount === null ||
				!issue_date ||
				vat === undefined ||
				vat === null ||
				!currency ||
				!exchange_rate
			) {
				Logger.error("[PayableDebts] Missing required fields", { customer_id, amount, vat, issue_date, currency });
				return ApiResponse.error("Customer, amount, issue date, VAT, currency, and exchange rate are required");
			}

			const [affectedRows] = await repo.update(id, companyId, {
				customer_id,
				amount,
				discount,
				vat,
				withholding,
				currency,
				exchange_rate,
				issue_date,
				due_date: due_date || null,
				invoice_no: invoice_no || null,
				description: description || null,
			});

			if (affectedRows === 0) {
				const exists = await repo.findById(id, companyId);
				if (!exists) {
					Logger.error("[PayableDebts] No debt found with provided ID", { debtId: id, companyId });
					return ApiResponse.error("No debt found with the provided ID");
				}
			}

			Logger.info("[PayableDebts] Debt updated successfully", { debtId: id, companyId });
			return ApiResponse.success(null, "Debt updated successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableDebts] Error updating debt", { debtId: id, companyId, error: error.message });
			return ApiResponse.error("Failed to update debt");
		}
	}

	static async Delete(id: UUID, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[PayableDebts] Deleting debt", { debtId: id, companyId });

			if (!id) {
				Logger.error("[PayableDebts] Missing debt ID");
				return ApiResponse.error("Debt ID is required");
			}

			const deletedCount = await repo.delete(id, companyId, userId);

			if (deletedCount === 0) {
				Logger.error("[PayableDebts] No debt found with provided ID", { debtId: id, companyId });
				return ApiResponse.error("No debt found with the provided ID");
			}

			Logger.info("[PayableDebts] Debt deleted successfully", { debtId: id, companyId });
			return ApiResponse.success(null, "Debt deleted successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableDebts] Error deleting debt", { debtId: id, companyId, error: error.message });
			return ApiResponse.error("Failed to delete debt");
		}
	}

	static async GetUpcomingDueDates(companyId: string, daysThreshold: number = 7) {
		try {
			Logger.debug("[PayableDebts] Fetching upcoming due dates", { companyId, daysThreshold });

            const result = await repo.getUpcomingDueDates(companyId, daysThreshold);

			Logger.debug("[PayableDebts] Upcoming due dates fetched", { companyId, count: result.length });
			return ApiResponse.success(result, "Upcoming due dates retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableDebts] Error fetching upcoming due dates", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve upcoming due dates");
		}
	}
}
