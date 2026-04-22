import { sequelize } from "@/lib/db/sequelize";
import { QueryTypes, Transaction } from "sequelize";
import { PaymentDto, UUID, SortItem, FilterItem, UpcomingDueDate } from "@common/types";
import { ReceivablePayments, PayablePayments } from "@/models";

export type PaymentDomain = "receivable" | "payable";

export class PaymentRepository {
	private domain: PaymentDomain;

	constructor(domain: PaymentDomain) {
		this.domain = domain;
	}

	private getModel() {
		return this.domain === "receivable" ? ReceivablePayments : PayablePayments;
	}

	async create(paymentData: Record<string, unknown>, transaction?: Transaction) {
		const Model = this.getModel();
		return await (Model as any).create(paymentData, { transaction });
	}

	async findById(id: UUID, companyId: UUID, transaction?: Transaction) {
		const Model = this.getModel();
		return await Model.findOne({ where: { id, company_id: companyId }, transaction });
	}

	async update(id: UUID, companyId: UUID, updateData: Partial<PaymentDto>, transaction?: Transaction) {
		const Model = this.getModel();
		return await Model.update(updateData as Record<string, unknown>, { where: { id, company_id: companyId }, transaction });
	}

	async delete(id: UUID, companyId: UUID, deletedBy: UUID, transaction?: Transaction) {
		const Model = this.getModel();
		await Model.update({ deleted_by: deletedBy } as Record<string, unknown>, { where: { id, company_id: companyId }, transaction });
		return await Model.destroy({ where: { id, company_id: companyId }, transaction });
	}

	async findAllWithPagination(
		companyId: UUID, limit: number, offset: number,
		sorting: SortItem[] = [], filters: FilterItem[] = []
	): Promise<{ rows: PaymentDto[]; count: number }> {
		const colMap: Record<string, string> = {
			customer_name: "c.name", amount: "p.amount", currency: "p.currency",
			exchange_rate: "p.exchange_rate", payment_method: "p.payment_method",
			payment_date: "p.payment_date", invoice_no: "p.invoice_no",
			description: "p.description", amount_in_try: "p.amount_in_try", due_date: "p.due_date",
		};

		let whereClause = "WHERE p.company_id = ? AND p.deleted_at IS NULL AND p.deleted_by IS NULL";
		const replacements: (string | number | string[])[] = [companyId];

		if (filters && filters.length > 0) {
			filters.forEach((filter) => {
				const { id, value } = filter;
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

		let orderClause = "ORDER BY p.payment_date DESC";
		if (sorting && sorting.length > 0) {
			const sortParts = sorting.map((sort) => {
				const dbCol = colMap[sort.id];
				if (!dbCol) return null;
				return `${dbCol} ${sort.desc ? "DESC" : "ASC"}`;
			}).filter(Boolean);
			if (sortParts.length > 0) orderClause = `ORDER BY ${sortParts.join(", ")}`;
		}

		const countQuery = `SELECT COUNT(*) as count FROM ${this.domain}_payments p JOIN ${this.domain}_customers c ON p.customer_id = c.id AND p.company_id = c.company_id ${whereClause}`;
		const countResult = (await sequelize.query(countQuery, { replacements, type: QueryTypes.SELECT })) as { count: number }[];
		const totalCount = countResult[0]?.count || 0;

		const query = `SELECT p.*, c.name AS customer_name, c.tax_number AS customer_tax_number FROM ${this.domain}_payments p JOIN ${this.domain}_customers c ON p.customer_id = c.id AND p.company_id = c.company_id ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
		const result = (await sequelize.query(query, { replacements: [...replacements, limit, offset], type: QueryTypes.SELECT })) as PaymentDto[];
		return { rows: result, count: totalCount };
	}

	async getUpcomingChecks(companyId: string, daysThreshold: number = 7): Promise<UpcomingDueDate[]> {
		const query = `SELECT p.id, p.amount as total, p.currency, p.due_date, DATEDIFF(p.due_date, CURDATE()) as days_remaining, c.name as customer_name FROM ${this.domain}_payments p JOIN ${this.domain}_customers c ON p.customer_id = c.id AND c.company_id = p.company_id WHERE p.company_id = ? AND p.deleted_at IS NULL AND p.deleted_by IS NULL AND c.deleted_at IS NULL AND p.payment_method = 'check' AND p.due_date IS NOT NULL AND p.due_date >= CURDATE() AND p.due_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY) ORDER BY p.due_date ASC LIMIT 10;`;
		return (await sequelize.query(query, { replacements: [companyId, daysThreshold], type: QueryTypes.SELECT })) as UpcomingDueDate[];
	}
}
