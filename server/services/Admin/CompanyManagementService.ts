import { CompanyDto, UUID , SortItem, FilterItem} from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import dotenv from "dotenv";
import { CompanyRepository } from "../../repositories/CompanyRepository";

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

			const newCompany = await CompanyRepository.create({
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
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[CompanyManagementService] Error creating company", error);
			return ApiResponse.error("Failed to create company");
		}
	}

	static async GetAll(page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		try {
			Logger.info("[CompanyManagementService] GetAll called", { page, limit, sorting, filters });

			const offset = page * limit;

			const result = await CompanyRepository.findAllWithPagination(limit, offset, sorting, filters);

			Logger.debug("[CompanyManagementService] Companies fetched successfully", {
				count: result.rows.length,
				totalCount: result.count,
			});

			return ApiResponse.success({ rows: result.rows, count: result.count }, "Companies retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[CompanyManagementService] Error fetching companies", error);
			return ApiResponse.error("Failed to fetch companies");
		}
	}

	static async GetById(id: UUID) {
		Logger.info("[CompanyManagementService] GetById called");

		try {
			Logger.debug("[CompanyManagementService] Fetching company");
			const company = await CompanyRepository.findById(id);

			if (!company) {
				Logger.warn("[CompanyManagementService] No company found");
				return ApiResponse.success(null);
			}

			Logger.info("[CompanyManagementService] Fetched company successfully");
			return ApiResponse.success(company);
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
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

			const [affectedRows] = await CompanyRepository.update(id, {
				name,
				phone,
				is_company,
				tax_number,
				tax_office,
				mersis_no,
				email,
				address,
			});

			if (affectedRows === 0) {
				Logger.warn("[CompanyManagementService] No company found or no changes made");
				// Check existence
				const exists = await CompanyRepository.findById(id);
				if (!exists) {
					return ApiResponse.success(null);
				}
				return ApiResponse.success(exists); // Return existing if no update
			}

			const updatedCompany = await CompanyRepository.findById(id);
			Logger.info("[CompanyManagementService] Updated company successfully");
			return ApiResponse.success(updatedCompany);
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[CompanyManagementService] Error updating company", error);
			return ApiResponse.error("Failed to update company");
		}
	}

	static async Delete(id: UUID) {
		try {
			Logger.info("[CompanyManagementService] Delete called", { id });

			Logger.debug("[CompanyManagementService] Deleting company");
			
			const deletedCount = await CompanyRepository.delete(id);

			if (deletedCount === 0) {
				Logger.warn("[CompanyManagementService] No company found");
				return ApiResponse.success(null);
			}

			Logger.info("[CompanyManagementService] Deleted company successfully");
			return ApiResponse.success({ id }); // Returning id as proxy for deleted object
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[CompanyManagementService] Error deleting company", error);
			return ApiResponse.error("Failed to delete company");
		}
	}
}
