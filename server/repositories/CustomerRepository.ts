import { sequelize } from "../lib/db/sequelize";
import { QueryTypes, Transaction } from "sequelize";
import { CustomerDto, DebtDto, PaymentDto, UUID, SortItem, FilterItem } from "@common/types";

export type CustomerDomain = "receivable" | "payable";

export class CustomerRepository {
    private domain: CustomerDomain;

    constructor(domain: CustomerDomain) {
        this.domain = domain;
    }

	private getModel() {
		const { ReceivableCustomers, PayableCustomers } = require("../models");
		return this.domain === "receivable" ? ReceivableCustomers : PayableCustomers;
	}

	async create(customerData: Omit<CustomerDto, "id" | "total_debt" | "total_payments" | "remaining_debt" | "created_at" | "updated_at"> & { company_id: string; created_by: string }, transaction?: Transaction) {
		const Model = this.getModel();
		return await Model.create(customerData, { transaction });
	}

	async findById(id: UUID, companyId: UUID, transaction?: Transaction) {
		const Model = this.getModel();
		return await Model.findOne({ where: { id, company_id: companyId }, transaction });
	}

	async update(id: UUID, companyId: UUID, updateData: Partial<CustomerDto>, transaction?: Transaction) {
		const Model = this.getModel();
		return await Model.update(updateData, { where: { id, company_id: companyId }, transaction });
	}

	async delete(id: UUID, companyId: UUID, deletedBy: UUID, transaction?: Transaction) {
		const Model = this.getModel();
		await Model.update({ deleted_by: deletedBy }, { where: { id, company_id: companyId }, transaction });
		return await Model.destroy({ where: { id, company_id: companyId }, transaction });
	}

	async findAllIdAndName(companyId: UUID) {
		const Model = this.getModel();
		return await Model.findAll({
			attributes: ["id", "name"],
			where: { company_id: companyId },
		});
	}

	async findAllWithSummary(
		companyId: UUID,
		limit: number,
		offset: number,
		sorting: SortItem[] = [],
		filters: FilterItem[] = []
	): Promise<{ rows: CustomerDto[]; count: number }> {
        const colMap: Record<string, string> = {
            "name": "c.name",
            "is_company": "c.is_company",
            "tax_office": "c.tax_office",
            "tax_number": "c.tax_number",
            "mersis_no": "c.mersis_no",
            "total_debt": "d.total_debt",
            "total_payments": "p.total_payments",
            "remaining_debt": "(COALESCE(d.total_debt, 0) - COALESCE(p.total_payments, 0))"
        };

        let whereClause = "WHERE c.company_id = ? AND c.deleted_at IS NULL";
        const replacements: (string | number | number[] | string[])[] = [companyId];

        if (filters && filters.length > 0) {
            filters.forEach((filter) => {
                const { id, value } = filter;
                
                if (id === "is_company") {
                     const boolValues = Array.isArray(value) ? value : [value];
                     const mapped = boolValues.map((v) => String(v) === "true" ? 1 : 0);
                     if (mapped.length > 0) {
                         whereClause += ` AND c.is_company IN (?)`;
                         replacements.push(mapped);
                     }
                     return;
                }

                if (id === "debt_status") {
                    const statuses = Array.isArray(value) ? value : [value];
                    const conditions: string[] = [];
                    statuses.forEach((s) => {
                        const status = String(s);
                        if (status === "HAS_DEBT") conditions.push(`(COALESCE(d.total_debt, 0) - COALESCE(p.total_payments, 0)) > 0.005`);
                        if (status === "HAS_RECEIVABLE") conditions.push(`(COALESCE(d.total_debt, 0) - COALESCE(p.total_payments, 0)) < -0.005`);
                        if (status === "HAS_NO_DEBT" || status === "HAS_NO_RECEIVABLE") conditions.push(`ABS(COALESCE(d.total_debt, 0) - COALESCE(p.total_payments, 0)) <= 0.005`);
                    });
                    
                    if (conditions.length > 0) {
                        whereClause += ` AND (${conditions.join(" OR ")})`;
                    }
                    return;
                }

                const dbCol = colMap[id];
                if (!dbCol) return;

                if (Array.isArray(value) && value.length > 0) {
                    whereClause += ` AND ${dbCol} IN (?)`;
                    replacements.push(value as string[]);
                } else if (typeof value === "string" && value.trim() !== "") {
                    whereClause += ` AND ${dbCol} LIKE ?`;
                    replacements.push(`%${value}%`);
                }
            });
        }

        let orderClause = "ORDER BY c.created_at DESC";
        if (sorting && sorting.length > 0) {
            const sortParts = sorting.map((sort) => {
                const dbCol = colMap[sort.id];
                if (!dbCol) return null;
                return `${dbCol} ${sort.desc ? "DESC" : "ASC"}`;
            }).filter(Boolean);
            
            if (sortParts.length > 0) {
                orderClause = `ORDER BY ${sortParts.join(", ")}`;
            }
        }

        const joins = `
            LEFT JOIN vw_${this.domain}_debt_summary d
            ON c.id = d.customer_id
            AND c.company_id = d.company_id
            LEFT JOIN vw_${this.domain}_payment_summary p
            ON c.id = p.customer_id
            AND c.company_id = p.company_id
        `;

		const countQuery = `
			SELECT COUNT(*) as count
			FROM ${this.domain}_customers c
            ${joins}
			${whereClause}
		`;

		const countResult = (await sequelize.query(countQuery, {
			replacements,
			type: QueryTypes.SELECT,
		})) as { count: number }[];

		const totalCount = countResult[0]?.count || 0;

		const query = `
			SELECT
		    c.*,
		    COALESCE(d.total_debt, 0) AS total_debt,
		    COALESCE(p.total_payments, 0) AS total_payments,
		    COALESCE(d.total_debt, 0) - COALESCE(p.total_payments, 0) AS remaining_debt
			FROM ${this.domain}_customers c
            ${joins}
			${whereClause}
			${orderClause}
			LIMIT ? OFFSET ?;
        `;

		const result = (await sequelize.query(query, {
			replacements: [...replacements, limit, offset],
			type: QueryTypes.SELECT,
		})) as CustomerDto[];
        
        return { rows: result, count: totalCount };
    }

	async getStatement(
		customerId: UUID,
		companyId: UUID,
		startDate?: string,
		endDate?: string
	): Promise<{ customer: CustomerDto; debts: DebtDto[]; payments: PaymentDto[] } | null> {
        
		const customerQuery = `
			SELECT
		    c.*,
		    COALESCE(ds.total_debt, 0) AS total_debt,
		    COALESCE(ps.total_payments, 0) AS total_payments,
		    COALESCE(ds.total_debt, 0) - COALESCE(ps.total_payments, 0) AS remaining_debt
			FROM ${this.domain}_customers c
			LEFT JOIN vw_${this.domain}_debt_summary ds
		    ON c.id = ds.customer_id
		    AND c.company_id = ds.company_id
			LEFT JOIN vw_${this.domain}_payment_summary ps
		    ON c.id = ps.customer_id
		    AND c.company_id = ps.company_id
			WHERE c.id = ?
			  AND c.company_id = ?
			  AND c.deleted_at IS NULL;
		`;

		const customerResult = (await sequelize.query(customerQuery, {
			replacements: [customerId, companyId],
			type: QueryTypes.SELECT,
		})) as CustomerDto[];

		if (customerResult.length === 0) {
			return null;
		}

		let debtsQuery = `
			SELECT
            d.id,
            d.invoice_no,
            d.amount,
            d.vat,
            d.currency,
            d.exchange_rate,
            d.total,
            d.total_in_try,
            d.description,
            d.issue_date,
            d.created_at
		    FROM ${this.domain}_debts d
		    INNER JOIN ${this.domain}_customers c ON d.customer_id = c.id AND d.company_id = c.company_id
		    WHERE d.customer_id = ?
            AND d.company_id = ?
            AND d.deleted_at IS NULL
            AND c.deleted_at IS NULL
        `;

		const debtParams: (string)[] = [customerId, companyId];

		if (startDate) {
			debtsQuery += ` AND d.issue_date >= ?`;
			debtParams.push(startDate);
		}

		if (endDate) {
			debtsQuery += ` AND d.issue_date <= ?`;
			debtParams.push(endDate);
		}

		debtsQuery += ` ORDER BY d.issue_date DESC, d.created_at DESC`;

		let paymentsQuery = `
			 SELECT
            p.id,
            p.invoice_no,
            p.amount,
            p.currency,
            p.exchange_rate,
            p.amount_in_try,
            p.payment_method,
            p.description,
            p.payment_date,
            p.created_at
		    FROM ${this.domain}_payments p
		    INNER JOIN ${this.domain}_customers c ON p.customer_id = c.id AND p.company_id = c.company_id
		    WHERE p.customer_id = ?
            AND p.company_id = ?
            AND p.deleted_at IS NULL
            AND c.deleted_at IS NULL
        `;

		const paymentParams: (string)[] = [customerId, companyId];

		if (startDate) {
			paymentsQuery += ` AND p.payment_date >= ?`;
			paymentParams.push(startDate);
		}

		if (endDate) {
			paymentsQuery += ` AND p.payment_date <= ?`;
			paymentParams.push(endDate);
		}

		paymentsQuery += ` ORDER BY p.payment_date DESC, p.created_at DESC`;

		const [debtsResult, paymentsResult] = await Promise.all([
			sequelize.query(debtsQuery, { replacements: debtParams, type: QueryTypes.SELECT }) as Promise<DebtDto[]>,
			sequelize.query(paymentsQuery, { replacements: paymentParams, type: QueryTypes.SELECT }) as Promise<PaymentDto[]>,
		]);

		return {
			customer: customerResult[0],
			debts: debtsResult,
			payments: paymentsResult,
		};
    }
}
