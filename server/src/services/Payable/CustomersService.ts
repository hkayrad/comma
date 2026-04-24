import { CustomerRepository } from "@/repositories/CustomerRepository";
import type { CustomerDto, UUID, SortItem, FilterItem } from "@comma/common/types";
import { Logger } from "@/lib/utils/logger";
import { NotFoundError, ValidationError } from "@/lib/errors/AppError";
import { sequelize } from "@/lib/db/sequelize";

const repo = new CustomerRepository("payable");

export default class PayableCustomersService {
	static async Create(customer: CustomerDto, userId: UUID, companyId: UUID) {
		Logger.info("[PayableCustomers] Creating customer", { companyId, customerName: customer.name, userId });

		const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

		if (!name || is_company === undefined || is_company === null) {
			throw new ValidationError("Name and customer type are required");
		}

		const newCustomer = await repo.create({
			name,
			phone: phone || null,
			is_company,
			tax_number: tax_number || null,
			tax_office: tax_office || null,
			mersis_no: mersis_no || null,
			email: email || null,
			address: address || null,
			company_id: companyId,
			created_by: userId,
		});

		Logger.info("[PayableCustomers] Customer created successfully", { customerId: newCustomer.id, companyId });
		return newCustomer.id;
	}

	static async CreateBatch(customers: CustomerDto[], userId: UUID, companyId: UUID) {
		Logger.info("[PayableCustomers] Creating customers batch", { companyId, count: customers.length, userId });

		const batchData = customers.map((customer) => ({
			name: customer.name,
			phone: customer.phone || null,
			is_company: customer.is_company,
			tax_number: customer.tax_number || null,
			tax_office: customer.tax_office || null,
			mersis_no: customer.mersis_no || null,
			email: customer.email || null,
			address: customer.address || null,
			company_id: companyId,
			created_by: userId,
		}));

		return await sequelize.transaction(async (t) => {
			const result = await repo.createBatch(batchData, t);
			Logger.info("[PayableCustomers] Customers batch created successfully", { companyId, count: result.length });
			return result;
		});
	}

	static async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		Logger.debug("[PayableCustomers] Fetching all customers", { companyId, page, limit, sorting, filters });
		const offset = page * limit;
		const repoResult = await repo.findAllWithSummary(companyId, limit, offset, sorting, filters);

		Logger.debug("[PayableCustomers] Customers fetched successfully", { companyId, count: repoResult.rows.length, totalCount: repoResult.count });

		return { rows: repoResult.rows, count: repoResult.count };
	}

	static async GetStatement(customerId: UUID, companyId: UUID, startDate?: string, endDate?: string) {
		Logger.debug("[PayableCustomers] Fetching customer statement", { customerId, companyId, startDate, endDate });

		if (!customerId) {
			throw new ValidationError("Customer ID is required");
		}

		const response = await repo.getStatement(customerId, companyId, startDate, endDate);

		if (!response) {
			throw new NotFoundError("Customer not found");
		}

		Logger.debug("[PayableCustomers] Customer statement fetched successfully", {
			customerId, companyId, debtsCount: response.debts.length, paymentsCount: response.payments.length,
		});

		return response;
	}

	static async GetIdAndName(companyId: UUID) {
		Logger.debug("[PayableCustomers] Fetching customer IDs and names", { companyId });

		const result = await repo.findAllIdAndName(companyId);

		Logger.debug("[PayableCustomers] Customer IDs and names fetched successfully", { companyId, count: result.length });

		return result;
	}

	static async Update(id: UUID, customer: CustomerDto, companyId: UUID) {
		Logger.info("[PayableCustomers] Updating customer", { customerId: id, companyId });

		if (!id) {
			throw new ValidationError("Customer ID is required");
		}

		const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

		if (!name || is_company === undefined || is_company === null) {
			throw new ValidationError("Name and customer type are required");
		}

		const [affectedRows] = await repo.update(id, companyId, {
			name,
			phone: phone || null,
			is_company,
			tax_number: tax_number || null,
			tax_office: tax_office || null,
			mersis_no: mersis_no || null,
			email: email || null,
			address: address || null,
		});

		if (affectedRows === 0) {
			const exists = await repo.findById(id, companyId);
			if (!exists) {
				throw new NotFoundError("Customer not found");
			}
		}

		Logger.info("[PayableCustomers] Customer updated successfully", { customerId: id, companyId });
	}

	static async Delete(id: UUID, userId: UUID, companyId: UUID) {
		Logger.info("[PayableCustomers] Deleting customer", { customerId: id, companyId });

		if (!id) {
			throw new ValidationError("Customer ID is required");
		}

		const deletedCount = await repo.delete(id, companyId, userId);

		if (deletedCount === 0) {
			throw new NotFoundError("Customer not found");
		}

		Logger.info("[PayableCustomers] Customer deleted successfully", { customerId: id, companyId });
	}

	static async Restore(id: UUID, userId: UUID, companyId: UUID) {
		Logger.info("[PayableCustomers] Restoring customer", { customerId: id, companyId });

		if (!id) {
			throw new ValidationError("Customer ID is required");
		}

		const restoredCount = await repo.restore(id, companyId);

		if (restoredCount === 0) {
			throw new NotFoundError("Customer not found");
		}

		Logger.info("[PayableCustomers] Customer restored successfully", { customerId: id, companyId });
	}
}
