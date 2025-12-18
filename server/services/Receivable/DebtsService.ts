import { DebtDto, InsertResult, Totals, UUID } from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { ReceivableDebts } from "../../models";
import { sequelize } from "../../lib/db/sequelize";
import { QueryTypes } from "sequelize";

export default class ReceivableDebtsService {
	static async Create(debt: DebtDto, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[ReceivableDebts] Creating debt", { companyId, customerId: debt.customer_id, userId });

			const { customer_id, amount, vat, currency, exchange_rate, issue_date, invoice_no, description } = debt;

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
				Logger.error("[ReceivableDebts] Missing required fields", {
					customer_id,
					amount,
					vat,
					issue_date,
					currency,
					exchange_rate,
				});
				return ApiResponse.error("Customer, amount, issue date, VAT, currency, and exchange rate are required");
			}

			const newDebt = await ReceivableDebts.create({
				customer_id,
				amount,
				vat,
				currency,
				exchange_rate,
				issue_date,
				invoice_no: invoice_no || null,
				description: description || null,
				company_id: companyId,
				created_by: userId,
			});

			Logger.info("[ReceivableDebts] Debt created successfully", { debtId: newDebt.id, companyId });
			return ApiResponse.success(newDebt.id, "Debt created successfully");
		} catch (error: any) {
			Logger.error("[ReceivableDebts] Error creating debt", { companyId, error: error.message });
			return ApiResponse.error("Failed to create debt");
		}
	}

	static async GetAll(companyId: string, page: number, limit: number, sorting: any[] = [], filters: any[] = []) {
		try {
			Logger.debug("[ReceivableDebts] Fetching all debts", { companyId, page, limit, sorting, filters });

			const offset = page * limit;

			const colMap: Record<string, string> = {
				customer_name: "c.name",
				amount: "d.amount",
				vat: "d.vat",
				total: "(d.amount + d.vat)",
				currency: "d.currency",
				exchange_rate: "d.exchange_rate",
				total_in_try: "((d.amount + d.vat) * d.exchange_rate)",
				issue_date: "d.issue_date",
				invoice_no: "d.invoice_no",
				description: "d.description",
			};

			let whereClause = "WHERE d.company_id = ? AND d.deleted_at IS NULL AND c.deleted_at IS NULL";
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

			let orderClause = "ORDER BY d.issue_date DESC";
			if (sorting && sorting.length > 0) {
				const sortParts = sorting
					.map((sort) => {
						const dbCol = colMap[sort.id];
						if (!dbCol) return null;
						return `${dbCol} ${sort.desc ? "DESC" : "ASC"}`;
					})
					.filter(Boolean);

				if (sortParts.length > 0) {
					orderClause = `ORDER BY ${sortParts.join(", ")}`;
				}
			}

			const countQuery = `
				SELECT COUNT(*) as count
				FROM receivable_debts d
				JOIN receivable_customers c ON d.customer_id = c.id AND c.company_id = d.company_id
				${whereClause}
			`;

			const countResult = (await sequelize.query(countQuery, {
				replacements,
				type: QueryTypes.SELECT,
			})) as { count: number }[];

			const totalCount = countResult[0]?.count || 0;

			const query = `
				SELECT
			    d.*,
			    c.name AS customer_name,
			    c.tax_number AS customer_tax_number
				FROM receivable_debts d
				JOIN receivable_customers c ON d.customer_id = c.id AND c.company_id = d.company_id
				${whereClause}
				${orderClause}
				LIMIT ? OFFSET ?;
            `;

			const result = (await sequelize.query(query, {
				replacements: [...replacements, limit, offset],
				type: QueryTypes.SELECT,
			})) as DebtDto[];

			Logger.debug("[ReceivableDebts] Debts fetched successfully", { companyId, count: result.length, totalCount });
			return ApiResponse.success({ rows: result, count: totalCount }, "Debts retrieved successfully");
		} catch (error: any) {
			Logger.error("[ReceivableDebts] Error fetching debts", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve debts");
		}
	}

	static async GetTotals(companyId: string, currency: string) {
		try {
			Logger.debug("[ReceivableDebts] Fetching totals", { companyId, currency });

			const query = `
				SELECT
			    COALESCE(d.total_in_try, 0) AS total_debts,
			    COALESCE(p.total_in_try, 0) AS total_payments,
			    COALESCE(d.total_in_try, 0) - COALESCE(p.total_in_try, 0) AS remaining_debt
				FROM (SELECT ? AS company_id) AS input
				-- Join Receivable Debt View
				LEFT JOIN vw_receivable_total_debt_by_company d
			    ON d.company_id = input.company_id
				-- Join Receivable Payment View
				LEFT JOIN vw_receivable_total_payments_by_company p
			    ON p.company_id = input.company_id;
      `;

			const result = (await sequelize.query(query, {
				replacements: [companyId],
				type: QueryTypes.SELECT,
			})) as Totals[];

			Logger.debug("[ReceivableDebts] Totals fetched successfully", { companyId, currency, totals: result[0] });

			if (!result || result.length === 0) {
				Logger.error("[ReceivableDebts] No debt data found", { companyId, currency });
				return ApiResponse.error("No debt data found");
			}

			return ApiResponse.success(result[0], "Total debt retrieved successfully");
		} catch (error: any) {
			Logger.error("[ReceivableDebts] Error fetching totals", { companyId, currency, error: error.message });
			return ApiResponse.error("Failed to retrieve total debt");
		}
	}

	static async Update(id: UUID, debt: DebtDto, companyId: UUID) {
		try {
			Logger.info("[ReceivableDebts] Updating debt", { debtId: id, companyId });

			if (!id) {
				Logger.error("[ReceivableDebts] Missing debt ID");
				return ApiResponse.error("Debt ID is required");
			}

			const { customer_id, amount, vat, currency, exchange_rate, issue_date, invoice_no, description } = debt;

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
				Logger.error("[ReceivableDebts] Missing required fields", { customer_id, amount, vat, issue_date, currency });
				return ApiResponse.error("Customer, amount, issue date, VAT, currency, and exchange rate are required");
			}

			const [affectedRows] = await ReceivableDebts.update(
				{
					customer_id,
					amount,
					vat,
					currency,
					exchange_rate,
					issue_date,
					invoice_no: invoice_no || null,
					description: description || null,
				},
				{
					where: { id, company_id: companyId },
				},
			);

			if (affectedRows === 0) {
				const exists = await ReceivableDebts.findOne({ where: { id, company_id: companyId } });
				if (!exists) {
					Logger.error("[ReceivableDebts] No debt found with provided ID", { debtId: id, companyId });
					return ApiResponse.error("No debt found with the provided ID");
				}
			}

			Logger.info("[ReceivableDebts] Debt updated successfully", { debtId: id, companyId });
			return ApiResponse.success(null, "Debt updated successfully");
		} catch (error: any) {
			Logger.error("[ReceivableDebts] Error updating debt", { debtId: id, companyId, error: error.message });
			return ApiResponse.error("Failed to update debt");
		}
	}

	static async Delete(id: UUID, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[ReceivableDebts] Deleting debt", { debtId: id, companyId });

			if (!id) {
				Logger.error("[ReceivableDebts] Missing debt ID");
				return ApiResponse.error("Debt ID is required");
			}

			await ReceivableDebts.update({ deleted_by: userId }, { where: { id, company_id: companyId } });

			const deletedCount = await ReceivableDebts.destroy({
				where: { id, company_id: companyId },
			});

			if (deletedCount === 0) {
				Logger.error("[ReceivableDebts] No debt found with provided ID", { debtId: id, companyId });
				return ApiResponse.error("No debt found with the provided ID");
			}

			Logger.info("[ReceivableDebts] Debt deleted successfully", { debtId: id, companyId });
			return ApiResponse.success(null, "Debt deleted successfully");
		} catch (error: any) {
			Logger.error("[ReceivableDebts] Error deleting debt", { debtId: id, companyId, error: error.message });
			return ApiResponse.error("Failed to delete debt");
		}
	}
}
