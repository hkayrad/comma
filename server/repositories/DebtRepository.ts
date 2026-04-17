import { sequelize } from "../lib/db/sequelize";
import { QueryTypes } from "sequelize";
import { DebtDto, Totals, UUID, SortItem, FilterItem } from "@common/types";

export type DebtDomain = "receivable" | "payable";

export class DebtRepository {
    private domain: DebtDomain;

    constructor(domain: DebtDomain) {
        this.domain = domain;
    }

	private getModel() {
		const { ReceivableDebts, PayableDebts } = require("../models");
		return this.domain === "receivable" ? ReceivableDebts : PayableDebts;
	}

	async create(debtData: any, transaction?: any) {
		const Model = this.getModel();
		return await Model.create(debtData, { transaction });
	}

	async findById(id: UUID, companyId: UUID, transaction?: any) {
		const Model = this.getModel();
		return await Model.findOne({ where: { id, company_id: companyId }, transaction });
	}

	async update(id: UUID, companyId: UUID, updateData: any, transaction?: any) {
		const Model = this.getModel();
		return await Model.update(updateData, { where: { id, company_id: companyId }, transaction });
	}

	async delete(id: UUID, companyId: UUID, deletedBy: UUID, transaction?: any) {
		const Model = this.getModel();
		await Model.update({ deleted_by: deletedBy } as any, { where: { id, company_id: companyId }, transaction });
		return await Model.destroy({ where: { id, company_id: companyId }, transaction });
	}

	async findAllWithSummary(
		companyId: string,
		limit: number,
		offset: number,
		sorting: SortItem[] = [],
		filters: FilterItem[] = []
	): Promise<{ rows: DebtDto[]; count: number }> {
        const colMap: Record<string, string> = {
            customer_name: "c.name",
            amount: "d.amount",
            vat: "d.vat",
            total: "(d.amount + d.vat)",
            discount: "d.discount",
            withholding: "d.withholding",
            currency: "d.currency",
            exchange_rate: "d.exchange_rate",
            total_in_try: "((d.amount + d.vat) * d.exchange_rate)",
            issue_date: "d.issue_date",
            due_date: "d.due_date",
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
            FROM ${this.domain}_debts d
            JOIN ${this.domain}_customers c ON d.customer_id = c.id AND c.company_id = d.company_id
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
            c.tax_number AS customer_tax_number,
            (
            SELECT COALESCE(SUM(p.amount_in_try), 0) >= (d.total_in_try)
            FROM ${this.domain}_payments p
            WHERE p.invoice_no = d.invoice_no AND p.company_id = d.company_id AND p.deleted_at IS NULL AND p.deleted_by IS NULL
            ) AS is_paid
            FROM ${this.domain}_debts d
            JOIN ${this.domain}_customers c ON d.customer_id = c.id AND c.company_id = d.company_id
            ${whereClause}
            ${orderClause}
            LIMIT ? OFFSET ?;
        `;

        const result = (await sequelize.query(query, {
            replacements: [...replacements, limit, offset],
            type: QueryTypes.SELECT,
        })) as DebtDto[];

        return { rows: result, count: totalCount };
    }

	async getTotals(companyId: UUID, currency: string): Promise<Totals | null> {
        const query = `
            SELECT
            COALESCE(d.total_in_try, 0) AS total_debts,
            COALESCE(p.total_in_try, 0) AS total_payments,
            COALESCE(d.total_in_try, 0) - COALESCE(p.total_in_try, 0) AS remaining_debt
            FROM (SELECT ? AS company_id) AS input
            LEFT JOIN vw_${this.domain}_total_debt_by_company d
            ON d.company_id = input.company_id
            LEFT JOIN vw_${this.domain}_total_payments_by_company p
            ON p.company_id = input.company_id;
        `;

        const result = (await sequelize.query(query, {
            replacements: [companyId],
            type: QueryTypes.SELECT,
        })) as Totals[];

        if (!result || result.length === 0) return null;
        return result[0];
    }

	async getUpcomingDueDates(companyId: string, daysThreshold: number = 7): Promise<any[]> {
        const query = `
            SELECT
                d.id,
                d.total,
                d.currency,
                d.due_date,
                DATEDIFF(d.due_date, CURDATE()) as days_remaining,
                c.name as customer_name
            FROM ${this.domain}_debts d
            JOIN ${this.domain}_customers c ON d.customer_id = c.id AND c.company_id = d.company_id
            WHERE d.company_id = ?
                AND d.deleted_at IS NULL
                AND c.deleted_at IS NULL
                AND d.due_date IS NOT NULL
                AND d.due_date >= CURDATE()
                AND d.due_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
                AND (
                    SELECT COALESCE(SUM(p.amount_in_try), 0)
                    FROM ${this.domain}_payments p
                    WHERE p.invoice_no = d.invoice_no AND p.company_id = d.company_id AND p.deleted_at IS NULL AND p.deleted_by IS NULL
                ) < d.total_in_try
            ORDER BY d.due_date ASC
            LIMIT 10;
        `;

        const result = await sequelize.query(query, {
            replacements: [companyId, daysThreshold],
            type: QueryTypes.SELECT,
        });

        return result;
    }

	async getMonthlyStats(companyId: string, start: Date, end: Date) {
		const Model = this.getModel();
		const { fn, col, literal, Op } = require("sequelize");

		return await Model.findAll({
			attributes: [
				[fn("DATE_FORMAT", col("issue_date"), "%Y-%m"), "month"],
				[fn("SUM", literal("amount + vat - COALESCE(discount, 0)")), "total"],
			],
			where: {
				company_id: companyId,
				issue_date: {
					[Op.gte]: start,
					[Op.lt]: end,
				},
				deleted_at: null,
			},
			group: [fn("DATE_FORMAT", col("issue_date"), "%Y-%m")],
			order: [[literal("month"), "ASC"]],
			raw: true,
		}) as unknown as { month: string; total: string }[];
	}
}
