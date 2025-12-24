import { CompanyDto, UUID } from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import dotenv from "dotenv";
import { Companies } from "../../models";
import { sequelize } from "../../lib/db/sequelize";
import { QueryTypes } from "sequelize";

dotenv.config();

export class CompanyManagementService {
	static async Create(company: CompanyDto) {
		try {
			Logger.info("[CompanyManagementService] Creating company", { company });

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = company;

			if (!name) {
				Logger.error("[CompanyManagementService] Invalid company data", { company });
				return ApiResponse.error("Invalid company data");
			}

			const newCompany = await Companies.create({
				name,
				phone,
				is_company,
				tax_number,
				tax_office,
				mersis_no,
				email,
				address,
			});

			Logger.info("[CompanyManagementService] Company created successfully");
			return ApiResponse.success(newCompany.id, "Company created successfully");
		} catch (error: any) {
			Logger.error("[CompanyManagementService] Error creating company", error);
			return ApiResponse.error("Failed to create company");
		}
	}

	static async GetAll(page: number, limit: number, sorting: any[] = [], filters: any[] = []) {
		try {
			Logger.info("[CompanyManagementService] GetAll called", { page, limit, sorting, filters });

			const offset = page * limit;

			const colMap: Record<string, string> = {
				name: "c.name",
				is_company: "c.is_company",
				email: "c.email",
				phone: "c.phone",
				tax_number: "c.tax_number",
				tax_office: "c.tax_office",
				mersis_no: "c.mersis_no",
				address: "c.address",
				created_at: "c.created_at",
			};

			let whereClause = "WHERE c.deleted_at IS NULL";
			const replacements: any[] = [];

			if (filters && filters.length > 0) {
				filters.forEach((filter) => {
					const { id, value } = filter;

					if (id === "is_company") {
						const values = Array.isArray(value) ? value : [value];
						const mapped = values.map((v: string) => parseInt(v, 10)).filter((v) => !isNaN(v));
						if (mapped.length > 0) {
							whereClause += ` AND c.is_company IN (?)`;
							replacements.push(mapped);
						}
						return;
					}

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

			let orderClause = "ORDER BY c.created_at DESC";
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
				FROM companies c
				${whereClause}
			`;

			const countResult = (await sequelize.query(countQuery, {
				replacements,
				type: QueryTypes.SELECT,
			})) as { count: number }[];

			const totalCount = countResult[0]?.count || 0;

			const query = `
				SELECT
					c.id,
					c.name,
					c.is_company,
					c.email,
					c.phone,
					c.tax_number,
					c.tax_office,
					c.mersis_no,
					c.address,
					c.small_logo_path,
					c.large_logo_path,
					c.created_at,
					c.updated_at
				FROM companies c
				${whereClause}
				${orderClause}
				LIMIT ? OFFSET ?;
			`;

			const result = (await sequelize.query(query, {
				replacements: [...replacements, limit, offset],
				type: QueryTypes.SELECT,
			})) as CompanyDto[];

			Logger.debug("[CompanyManagementService] Companies fetched successfully", {
				count: result.length,
				totalCount,
			});

			return ApiResponse.success({ rows: result, count: totalCount }, "Companies retrieved successfully");
		} catch (error: any) {
			Logger.error("[CompanyManagementService] Error fetching companies", error);
			return ApiResponse.error("Failed to fetch companies");
		}
	}

	static async GetById(id: UUID) {
		Logger.info("[CompanyManagementService] GetById called");

		try {
			Logger.debug("[CompanyManagementService] Fetching company");
			const company = await Companies.findByPk(id);

			if (!company) {
				Logger.warn("[CompanyManagementService] No company found");
				return ApiResponse.success(null);
			}

			Logger.info("[CompanyManagementService] Fetched company successfully");
			return ApiResponse.success(company);
		} catch (error: any) {
			Logger.error("[CompanyManagementService] Error fetching company", error);
			return ApiResponse.error("Failed to fetch company");
		}
	}

	static async Update(id: UUID, company: CompanyDto) {
		try {
			Logger.info("[CompanyManagementService] Update called", { company });

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = company;

			if (!name) {
				Logger.error("[CompanyManagementService] Invalid company data", { company });
				return ApiResponse.error("Invalid company data");
			}

			Logger.debug("[CompanyManagementService] Updating company");

			const [affectedRows] = await Companies.update(
				{
					name,
					phone,
					is_company,
					tax_number,
					tax_office,
					mersis_no,
					email,
					address,
				},
				{
					where: { id },
				},
			);

			if (affectedRows === 0) {
				Logger.warn("[CompanyManagementService] No company found or no changes made");
				// Check existence
				const exists = await Companies.findByPk(id);
				if (!exists) {
					return ApiResponse.success(null);
				}
				return ApiResponse.success(exists); // Return existing if no update
			}

			const updatedCompany = await Companies.findByPk(id);
			Logger.info("[CompanyManagementService] Updated company successfully");
			return ApiResponse.success(updatedCompany);
		} catch (error: any) {
			Logger.error("[CompanyManagementService] Error updating company", error);
			return ApiResponse.error("Failed to update company");
		}
	}

	static async Delete(id: UUID) {
		try {
			Logger.info("[CompanyManagementService] Delete called", { id });

			Logger.debug("[CompanyManagementService] Deleting company");
			// Soft delete via paranoid: true
			const deletedCount = await Companies.destroy({
				where: { id },
			});

			if (deletedCount === 0) {
				Logger.warn("[CompanyManagementService] No company found");
				return ApiResponse.success(null);
			}

			Logger.info("[CompanyManagementService] Deleted company successfully");
			return ApiResponse.success({ id }); // Returning id as proxy for deleted object
		} catch (error: any) {
			Logger.error("[CompanyManagementService] Error deleting company", error);
			return ApiResponse.error("Failed to delete company");
		}
	}
}
