import { Companies } from "@/models";
import { CompanyDto, UUID, SortItem, FilterItem } from "@comma/common/types";
import { sequelize } from "@/lib/db/sequelize";
import { QueryTypes, Transaction } from "sequelize";

export class CompanyRepository {
	static async findById(id: UUID, transaction?: Transaction) {
		return await Companies.findByPk(id, { transaction });
	}

	static async findByIdWithSpecificFields(id: UUID, attributes: string[], transaction?: Transaction) {
		return await Companies.findByPk(id, { attributes, transaction });
	}

	static async create(companyData: Partial<CompanyDto>, transaction?: Transaction) {
		return await Companies.create(companyData as Companies["_creationAttributes"], { transaction });
	}

	static async update(id: UUID, updateData: Partial<CompanyDto>, transaction?: Transaction) {
		return await Companies.update(updateData as Partial<Companies>, { where: { id }, transaction });
	}

	static async delete(id: UUID, transaction?: Transaction) {
		return await Companies.destroy({ where: { id }, transaction });
	}

	static async findAllWithPagination(
		limit: number, offset: number,
		sorting: SortItem[] = [], filters: FilterItem[] = []
	): Promise<{ rows: CompanyDto[]; count: number }> {
		const colMap: Record<string, string> = {
			name: "c.name", is_company: "c.is_company", email: "c.email",
			phone: "c.phone", tax_number: "c.tax_number", tax_office: "c.tax_office",
			mersis_no: "c.mersis_no", address: "c.address", created_at: "c.created_at",
		};

		let whereClause = "WHERE c.deleted_at IS NULL";
		const replacements: (string | number | number[] | string[])[] = [];

		if (filters && filters.length > 0) {
			filters.forEach((filter) => {
				const { id, value } = filter;
				if (id === "is_company") {
					const values = Array.isArray(value) ? value : [value];
					const mapped = values.map((v) => parseInt(String(v), 10)).filter((v) => !isNaN(v));
					if (mapped.length > 0) { whereClause += ` AND c.is_company IN (?)`; replacements.push(mapped); }
					return;
				}
				const dbCol = colMap[id];
				if (!dbCol) return;
				if (Array.isArray(value) && value.length > 0) {
					whereClause += ` AND ${dbCol} IN (?)`; replacements.push(value as string[]);
				} else if (typeof value === "string" && value.trim() !== "") {
					whereClause += ` AND ${dbCol} LIKE ?`; replacements.push(`%${value}%`);
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
			if (sortParts.length > 0) orderClause = `ORDER BY ${sortParts.join(", ")}`;
		}

		const countResult = (await sequelize.query(`SELECT COUNT(*) as count FROM companies c ${whereClause}`, { replacements, type: QueryTypes.SELECT })) as { count: number }[];
		const totalCount = countResult[0]?.count || 0;

		const query = `SELECT c.id, c.name, c.is_company, c.email, c.phone, c.tax_number, c.tax_office, c.mersis_no, c.address, c.small_logo_path, c.large_logo_path, c.created_at, c.updated_at FROM companies c ${whereClause} ${orderClause} LIMIT ? OFFSET ?;`;
		const result = (await sequelize.query(query, { replacements: [...replacements, limit, offset], type: QueryTypes.SELECT })) as CompanyDto[];
		return { rows: result, count: totalCount };
	}
}
