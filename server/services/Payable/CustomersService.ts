import { CustomerRepository } from "../../repositories/CustomerRepository";
import { CustomerDto, UUID , SortItem, FilterItem} from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";

const repo = new CustomerRepository("payable");

export default class PayableCustomersService {
	static async Create(customer: CustomerDto, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[PayableCustomers] Creating customer", { companyId, customerName: customer.name, userId });

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

			if (!name || is_company === undefined || is_company === null) {
				Logger.error("[PayableCustomers] Missing required fields", { name, is_company });
				return ApiResponse.error("Name and customer type are required");
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
			return ApiResponse.success(newCustomer.id, "Customer created successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableCustomers] Error creating customer", { companyId, error: error.message });
			return ApiResponse.error("Error creating customer");
		}
	}

	static async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		try {
			Logger.debug("[PayableCustomers] Fetching all customers", { companyId, page, limit, sorting, filters });
			const offset = page * limit;
            const repoResult = await repo.findAllWithSummary(companyId, limit, offset, sorting, filters);

			Logger.debug("[PayableCustomers] Customers fetched successfully", { companyId, count: repoResult.rows.length, totalCount: repoResult.count });

			return ApiResponse.success({ rows: repoResult.rows, count: repoResult.count }, "Customers retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableCustomers] Error fetching customers", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve customers");
		}
	}

	static async GetStatement(customerId: UUID, companyId: UUID, startDate?: string, endDate?: string) {
		try {
			Logger.debug("[PayableCustomers] Fetching customer statement", {
				customerId,
				companyId,
				startDate,
				endDate,
			});

			if (!customerId) {
				Logger.error("[PayableCustomers] Missing customer ID");
				return ApiResponse.error("Customer ID is required");
			}

            const response = await repo.getStatement(customerId, companyId, startDate, endDate);

			if (!response) {
				Logger.error("[PayableCustomers] Customer not found", { customerId, companyId });
				return ApiResponse.error("Customer not found");
			}

			Logger.debug("[PayableCustomers] Customer statement fetched successfully", {
				customerId,
				companyId,
				debtsCount: response.debts.length,
				paymentsCount: response.payments.length,
			});

			return ApiResponse.success(response, "Customer statement retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableCustomers] Error fetching customer statement", {
				customerId,
				companyId,
				error: error.message,
			});
			return ApiResponse.error("Failed to retrieve customer statement");
		}
	}

	static async GetIdAndName(companyId: UUID) {
		try {
			Logger.debug("[PayableCustomers] Fetching customer IDs and names", { companyId });

			const result = await repo.findAllIdAndName(companyId);

			Logger.debug("[PayableCustomers] Customer IDs and names fetched successfully", {
				companyId,
				count: result.length,
			});

			if (result.length === 0) {
				Logger.debug("[PayableCustomers] No customers found", { companyId });
				return ApiResponse.success([], "No customers found");
			}

			return ApiResponse.success(result, "Customers retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableCustomers] Error fetching customer IDs and names", { companyId, error: error.message });
			return ApiResponse.error("Error retrieving customers");
		}
	}

	static async Update(id: UUID, customer: CustomerDto, companyId: UUID) {
		try {
			Logger.info("[PayableCustomers] Updating customer", { customerId: id, companyId });

			if (!id) {
				Logger.error("[PayableCustomers] Missing customer ID");
				return ApiResponse.error("Customer ID is required");
			}

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

			if (!name || is_company === undefined || is_company === null) {
				Logger.error("[PayableCustomers] Missing required fields", { name, is_company });
				return ApiResponse.error("Name and customer type are required");
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
					Logger.error("[PayableCustomers] Failed to update customer or customer not found", {
						customerId: id,
						companyId,
					});
					return ApiResponse.error("Failed to update customer or customer not found");
				}
			}

			Logger.info("[PayableCustomers] Customer updated successfully", { customerId: id, companyId });
			return ApiResponse.success(null, "Customer updated successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableCustomers] Error updating customer", {
				customerId: id,
				companyId,
				error: error.message,
			});
			return ApiResponse.error("Error updating customer");
		}
	}

	static async Delete(id: UUID, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[PayableCustomers] Deleting customer", { customerId: id, companyId });

			if (!id) {
				Logger.error("[PayableCustomers] Missing customer ID");
				return ApiResponse.error("Customer ID is required");
			}

			const deletedCount = await repo.delete(id, companyId, userId);

			if (deletedCount === 0) {
				Logger.error("[PayableCustomers] Failed to delete customer or customer not found", {
					customerId: id,
					companyId,
				});
				return ApiResponse.error("Failed to delete customer or customer not found");
			}

			Logger.info("[PayableCustomers] Customer deleted successfully", { customerId: id, companyId });
			return ApiResponse.success(null, "Customer deleted successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[PayableCustomers] Error deleting customer", {
				customerId: id,
				companyId,
				error: error.message,
			});
			return ApiResponse.error("Error deleting customer");
		}
	}
}
