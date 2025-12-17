import { CompanyDto, UUID } from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import dotenv from "dotenv";
import { Companies } from "../../models";

dotenv.config();

export class CompanyManagementService {
	static async Create(company: CompanyDto) {
		try {
			Logger.info("[CompanyManagementService] Creating company", { company });

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = company;

			if (!name || !email) {
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

	static async GetAll() {
		Logger.info("[CompanyManagementService] GetAll called");

		try {
			Logger.debug("[CompanyManagementService] Fetching companies");
			// Legacy query had `WHERE is_company != 2`. Assuming standard boolean field now.
			const rows = await Companies.findAll();

			if (!rows || rows.length === 0) {
				Logger.warn("[CompanyManagementService] No companies found");
				return ApiResponse.success([]);
			}

			Logger.info("[CompanyManagementService] Fetched companies successfully");
			return ApiResponse.success(rows);
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

			if (!name || !email) {
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
				}
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
