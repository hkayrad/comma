import { AuditLogs } from "@/models/AuditLogs";
import type { AuditLogCreateDto, SortItem, FilterItem } from "@comma/common/types";
import { Transaction, Op, WhereOptions } from "sequelize";

export class AuditLogRepository {
	static async createLog(data: AuditLogCreateDto, transaction?: Transaction): Promise<AuditLogs> {
		return await AuditLogs.create(data as any, { transaction });
	}

	static async findAllWithPagination(
		companyId?: string,
		limit: number = 20,
		offset: number = 0,
		sorting: SortItem[] = [],
		filters: FilterItem[] = []
	): Promise<{ rows: AuditLogs[]; count: number }> {
		const where: WhereOptions<any> = {};
		if (companyId && companyId !== "ALL" && companyId !== "*") {
			where.company_id = companyId;
		}

		if (filters && filters.length > 0) {
			const createdAtConditions: any = {};

			filters.forEach((filter) => {
				const { id, value } = filter;
				if (value === undefined || value === null || value === "") return;

				if (id === "entity_type") {
					(where as any).entity_type = Array.isArray(value) ? { [Op.in]: value } : { [Op.like]: `%${value}%` };
				} else if (id === "entity_id") {
					(where as any).entity_id = Array.isArray(value) ? { [Op.in]: value } : { [Op.like]: `%${value}%` };
				} else if (id === "action") {
					(where as any).action = Array.isArray(value) ? { [Op.in]: value } : { [Op.like]: `%${value}%` };
				} else if (id === "user_id") {
					(where as any).user_id = Array.isArray(value) ? { [Op.in]: value } : { [Op.like]: `%${value}%` };
				} else if (
					id === "start_date" ||
					id === "startDate" ||
					id === "date_from" ||
					id === "from" ||
					id === "created_at_gte"
				) {
					createdAtConditions[Op.gte] = new Date(value as string | number | Date);
				} else if (
					id === "end_date" ||
					id === "endDate" ||
					id === "date_to" ||
					id === "to" ||
					id === "created_at_lte"
				) {
					createdAtConditions[Op.lte] = new Date(value as string | number | Date);
				} else if (id === "created_at") {
					if (Array.isArray(value)) {
						if (value[0]) createdAtConditions[Op.gte] = new Date(value[0]);
						if (value[1]) createdAtConditions[Op.lte] = new Date(value[1]);
					} else if (typeof value === "object" && value !== null) {
						if ((value as any).start || (value as any).from) {
							createdAtConditions[Op.gte] = new Date((value as any).start || (value as any).from);
						}
						if ((value as any).end || (value as any).to) {
							createdAtConditions[Op.lte] = new Date((value as any).end || (value as any).to);
						}
					} else if (typeof value === "string") {
						createdAtConditions[Op.gte] = new Date(value);
					}
				}
			});

			if (Object.getOwnPropertySymbols(createdAtConditions).length > 0 || Object.keys(createdAtConditions).length > 0) {
				(where as any).created_at = createdAtConditions;
			}
		}

		const allowedSortColumns = new Set([
			"id",
			"company_id",
			"user_id",
			"entity_type",
			"entity_id",
			"action",
			"created_at",
			"ip_address",
			"user_agent",
		]);

		let order: any[] = [["created_at", "DESC"]];
		if (sorting && sorting.length > 0) {
			const validSorts = sorting
				.filter((s) => allowedSortColumns.has(s.id))
				.map((s) => [s.id, s.desc ? "DESC" : "ASC"]);
			if (validSorts.length > 0) {
				order = validSorts;
			}
		}

		const { rows, count } = await AuditLogs.findAndCountAll({
			where,
			limit,
			offset,
			order,
			distinct: true,
		});

		return { rows, count };
	}
}
