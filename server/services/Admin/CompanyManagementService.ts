import type { CompanyDto, UUID, SortItem, FilterItem } from "@comma/common/types";
import { Logger } from "@/lib/utils/logger";
import { CompanyRepository } from "@/repositories/CompanyRepository";
import { NotFoundError, ValidationError } from "@/lib/errors/AppError";

export class CompanyManagementService {
	static async Create(company: CompanyDto) {
		Logger.info("[CompanyManagement] Creating company", { companyName: company.name });

		const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = company;
		if (!name) throw new ValidationError("Company name is required");

		const newCompany = await CompanyRepository.create({
			name, phone, is_company, tax_number, tax_office, mersis_no, email, address,
		});

		Logger.info("[CompanyManagement] Company created successfully", { companyId: newCompany.id });
		return newCompany.id;
	}

	static async GetAll(page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		Logger.info("[CompanyManagement] GetAll called", { page, limit });
		const offset = page * limit;
		const result = await CompanyRepository.findAllWithPagination(limit, offset, sorting, filters);
		Logger.debug("[CompanyManagement] Companies fetched", { count: result.rows.length, totalCount: result.count });
		return { rows: result.rows, count: result.count };
	}

	static async GetById(id: UUID) {
		Logger.info("[CompanyManagement] GetById called", { id });
		const company = await CompanyRepository.findById(id);
		if (!company) throw new NotFoundError("Company not found");
		Logger.info("[CompanyManagement] Fetched company successfully", { id });
		return company;
	}

	static async Update(id: UUID, company: CompanyDto) {
		Logger.info("[CompanyManagement] Update called", { id });
		const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = company;
		if (!name) throw new ValidationError("Company name is required");

		const [affectedRows] = await CompanyRepository.update(id, {
			name, phone, is_company, tax_number, tax_office, mersis_no, email, address,
		});

		if (affectedRows === 0) {
			const exists = await CompanyRepository.findById(id);
			if (!exists) throw new NotFoundError("Company not found");
		}

		const updatedCompany = await CompanyRepository.findById(id);
		Logger.info("[CompanyManagement] Updated company successfully", { id });
		return updatedCompany;
	}

	static async Delete(id: UUID) {
		Logger.info("[CompanyManagement] Delete called", { id });
		const deletedCount = await CompanyRepository.delete(id);
		if (deletedCount === 0) throw new NotFoundError("Company not found");
		Logger.info("[CompanyManagement] Deleted company successfully", { id });
	}

	static async Restore(id: UUID) {
		Logger.info("[CompanyManagement] Restore called", { id });
		await CompanyRepository.restore(id);
		Logger.info("[CompanyManagement] Restored company successfully", { id });
	}
}
