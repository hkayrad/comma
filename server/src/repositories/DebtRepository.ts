import { sequelize } from "@/lib/db/sequelize";
import { QueryTypes, Transaction, fn, col, literal, Op } from "sequelize";
import type { DebtDto, Totals, UUID, SortItem, FilterItem, UpcomingDueDate } from "@comma/common/types";
import { 
    ReceivableDebts, PayableDebts, 
    ReceivablePayments, PayablePayments, 
    ReceivableCustomers, PayableCustomers 
} from "@/models";

export type DebtDomain = "receivable" | "payable";

export class DebtRepository {
    private domain: DebtDomain;

    constructor(domain: DebtDomain) {
        this.domain = domain;
    }

	private getModel(): any {
		return (this.domain === "receivable" ? ReceivableDebts : PayableDebts) as any;
	}

    private getModels() {
        const isReceivable = this.domain === "receivable";
        return {
            Debt: (isReceivable ? ReceivableDebts : PayableDebts) as any,
            Customer: (isReceivable ? ReceivableCustomers : PayableCustomers) as any,
            Payment: (isReceivable ? ReceivablePayments : PayablePayments) as any,
            paymentTable: isReceivable ? "receivable_payments" : "payable_payments",
            debtTable: isReceivable ? "receivable_debts" : "payable_debts"
        };
    }

	async create(debtData: Record<string, unknown>, transaction?: Transaction) {
		const Model = this.getModel() as any;
		return await Model.create(debtData as any, { transaction });
	}

	async createBatch(data: any[], transaction?: Transaction) {
		const Model = this.getModel();
		return await (Model as any).bulkCreate(data, { transaction });
	}

	async findById(id: UUID, companyId: UUID, transaction?: Transaction) {
		const Model = this.getModel() as any;
		return await Model.findOne({ where: { id, company_id: companyId }, transaction });
	}

	async update(id: UUID, companyId: UUID, updateData: Partial<DebtDto>, transaction?: Transaction) {
		const Model = this.getModel() as any;
		return await Model.update(updateData as any, { where: { id, company_id: companyId }, transaction });
	}

	async delete(id: UUID, companyId: UUID, deletedBy: UUID, transaction?: Transaction) {
		const Model = this.getModel() as any;
		await Model.update({ deleted_by: deletedBy } as any, { where: { id, company_id: companyId }, transaction });
		return await Model.destroy({ where: { id, company_id: companyId }, transaction });
	}

	async restore(id: UUID, companyId: UUID, transaction?: Transaction) {
		const Model = this.getModel() as any;
		await Model.restore({ where: { id, company_id: companyId }, transaction });
		return await Model.update({ deleted_by: null } as any, { where: { id, company_id: companyId }, transaction });
	}

	async findAllWithSummary(
		companyId: string, limit: number, offset: number,
		sorting: SortItem[] = [], filters: FilterItem[] = []
	): Promise<{ rows: DebtDto[]; count: number }> {
        const { Debt, Customer, paymentTable } = this.getModels();
        const mainAlias = Debt.name;

        // Ensure associations are defined for the include block
        if (!Debt.associations.customer) {
            Debt.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
        }

        const where: any = {
            company_id: companyId,
        };

        const customerWhere: any = {
            deleted_at: null
        };

        if (filters && filters.length > 0) {
            filters.forEach((filter) => {
                const { id, value } = filter;
                if (value === undefined || value === null || value === "") return;

                if (id === "customer_name") {
                    customerWhere.name = { [Op.like]: `%${value}%` };
                } else if (id === "customer_id") {
                    where.customer_id = value;
                } else if (id === "invoice_no" || id === "description") {
                    where[id] = { [Op.like]: `%${value}%` };
                } else if (id === "currency") {
                    where.currency = Array.isArray(value) ? { [Op.in]: value } : value;
                } else if (id === "amount" || id === "vat" || id === "discount" || id === "withholding" || id === "exchange_rate") {
                    where[id] = value;
                } else if (id === "issue_date" || id === "due_date") {
                    where[id] = { [Op.like]: `%${value}%` };
                } else if (id === "total") {
                    where[Op.and] = [literal(`(amount + vat) LIKE '%${value}%'`)];
                } else if (id === "total_in_try") {
                    where[Op.and] = [literal(`((amount + vat) * exchange_rate) LIKE '%${value}%'`)];
                }
            });
        }

        const { rows, count } = await Debt.findAndCountAll({
            where: where as any,
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['name', ['tax_number', 'customer_tax_number']],
                    where: customerWhere as any,
                    required: true
                }
            ],
            attributes: {
                include: [
                    [literal('(amount + vat)'), 'total'],
                    [literal('((amount + vat) * exchange_rate)'), 'total_in_try'],
                    [
                        literal(`(
                            SELECT COALESCE(SUM(p.amount * p.exchange_rate), 0) >= (\`${mainAlias}\`.amount + \`${mainAlias}\`.vat) * \`${mainAlias}\`.exchange_rate
                            FROM ${paymentTable} AS p
                            WHERE p.invoice_no = \`${mainAlias}\`.invoice_no
                              AND p.company_id = \`${mainAlias}\`.company_id
                              AND p.customer_id = \`${mainAlias}\`.customer_id
                              AND p.deleted_at IS NULL
                        )`),
                        'is_paid'
                    ],
                    [
                        literal(`(
                            SELECT MAX(p.payment_date)
                            FROM ${paymentTable} AS p
                            WHERE p.invoice_no = \`${mainAlias}\`.invoice_no
                              AND p.company_id = \`${mainAlias}\`.company_id
                              AND p.customer_id = \`${mainAlias}\`.customer_id
                              AND p.deleted_at IS NULL
                        )`),
                        'last_payment_date'
                    ]
                ]
            },
            limit,
            offset,
            order: sorting.length > 0 
                ? sorting.map(s => {
                    if (s.id === 'customer_name') return [{ model: Customer, as: 'customer' }, 'name', s.desc ? 'DESC' : 'ASC'];
                    if (s.id === 'total') return [literal('(amount + vat)'), s.desc ? 'DESC' : 'ASC'];
                    if (s.id === 'total_in_try') return [literal('((amount + vat) * exchange_rate)'), s.desc ? 'DESC' : 'ASC'];
                    return [s.id, s.desc ? 'DESC' : 'ASC'];
                })
                : [['issue_date', 'DESC']],
            distinct: true
        } as any);

        return {
            rows: rows.map((r: any) => {
                const d = r.get({ plain: true });
                return {
                    ...d,
                    customer_name: d.customer?.name,
                    customer_tax_number: d.customer?.customer_tax_number,
                    is_paid: !!d.is_paid,
                    last_payment_date: d.last_payment_date
                };
            }) as any,
            count
        };
    }

	async getTotals(companyId: UUID, currency: string): Promise<Totals | null> {
        const { Debt, Payment, Customer } = this.getModels();
        
        if (!Debt.associations.customer) Debt.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
        if (!Payment.associations.customer) Payment.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

        const [debtResult, paymentResult] = await Promise.all([
            Debt.findOne({
                attributes: [
                    [fn("SUM", literal("(amount + vat) * exchange_rate")), "total_in_try"]
                ],
                include: [{
                    model: Customer,
                    as: 'customer',
                    attributes: [],
                    where: { deleted_at: null } as any,
                    required: true
                }],
                where: { company_id: companyId, deleted_at: null } as any,
                raw: true
            }),
            Payment.findOne({
                attributes: [
                    [fn("SUM", literal("amount * exchange_rate")), "total_in_try"]
                ],
                include: [{
                    model: Customer,
                    as: 'customer',
                    attributes: [],
                    where: { deleted_at: null } as any,
                    required: true
                }],
                where: { company_id: companyId, deleted_at: null } as any,
                raw: true
            })
        ]);

        const total_debts = parseFloat((debtResult as any)?.total_in_try || 0);
        const total_payments = parseFloat((paymentResult as any)?.total_in_try || 0);

        return {
            total_debts,
            total_payments,
            remaining_debt: total_debts - total_payments
        };
    }

	async getUpcomingDueDates(companyId: string, daysThreshold: number = 7): Promise<UpcomingDueDate[]> {
        const { Debt, Customer, paymentTable } = this.getModels();
        const mainAlias = Debt.name;

        if (!Debt.associations.customer) Debt.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

        const rows = await Debt.findAll({
            attributes: [
                'id',
                [literal('(amount + vat)'), 'total'],
                'currency',
                'due_date',
                [literal(`DATEDIFF(due_date, CURDATE())`), 'days_remaining']
            ],
            include: [{
                model: Customer,
                as: 'customer',
                attributes: ['name'],
                where: { deleted_at: null } as any,
                required: true
            }],
            where: {
                company_id: companyId,
                deleted_at: null,
                due_date: {
                    [Op.and]: [
                        { [Op.ne]: null },
                        { [Op.lte]: literal(`DATE_ADD(CURDATE(), INTERVAL ${daysThreshold} DAY)`) }
                    ]
                },
                [Op.and]: [
                    literal(`(
                        SELECT COALESCE(SUM(p.amount * p.exchange_rate), 0)
                        FROM ${paymentTable} AS p
                        WHERE p.invoice_no = \`${mainAlias}\`.invoice_no
                          AND p.company_id = \`${mainAlias}\`.company_id
                          AND p.customer_id = \`${mainAlias}\`.customer_id
                          AND p.deleted_at IS NULL
                    ) < (\`${mainAlias}\`.amount + \`${mainAlias}\`.vat) * \`${mainAlias}\`.exchange_rate`)
                ]
            } as any,
            order: [['due_date', 'ASC']],
            limit: 10,
            raw: true,
            nest: true
        });

        return rows.map((r: any) => ({
            id: r.id,
            total: r.total,
            currency: r.currency,
            due_date: r.due_date,
            days_remaining: r.days_remaining,
            customer_name: r.customer?.name
        })) as any;
    }

	async getMonthlyStats(companyId: string, start: Date, end: Date) {
		const Model = this.getModel() as any;
		return await Model.findAll({
			attributes: [[fn("DATE_FORMAT", col("issue_date"), "%Y-%m"), "month"], [fn("SUM", literal("amount + vat - COALESCE(discount, 0)")), "total"]],
			where: { company_id: companyId, issue_date: { [Op.gte]: start, [Op.lt]: end }, deleted_at: null },
			group: [fn("DATE_FORMAT", col("issue_date"), "%Y-%m")],
			order: [[literal("month"), "ASC"]],
			raw: true,
		}) as unknown as { month: string; total: string }[];
	}
}
