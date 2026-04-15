import { CustomerRepository } from "../../repositories/CustomerRepository";
import { CustomerDto, CustomerIdName, DebtDto, PaymentDto, UUID , SortItem, FilterItem} from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { ReceivableCustomers } from "../../models";
import { sequelize } from "../../lib/db/sequelize";
import { QueryTypes } from "sequelize";

const repo = new CustomerRepository("receivable");

export default class ReceivableCustomersService {
	static async Create(customer: CustomerDto, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[ReceivableCustomers] Creating customer", { companyId, customerName: customer.name, userId });

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

			if (!name || is_company === undefined || is_company === null) {
				Logger.error("[ReceivableCustomers] Missing required fields", { name, is_company });
				return ApiResponse.error("Name and customer type are required");
			}

			const newCustomer = await ReceivableCustomers.create({
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

			Logger.info("[ReceivableCustomers] Customer created successfully", { customerId: newCustomer.id, companyId });
			return ApiResponse.success(newCustomer.id, "Customer created successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[ReceivableCustomers] Error creating customer", { companyId, error: error.message });
			return ApiResponse.error("Error creating customer");
		}
	}

	static async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		try {
			Logger.debug("[ReceivableCustomers] Fetching all customers", { companyId, page, limit, sorting, filters });
			const offset = page * limit;
            const repoResult = await repo.findAllWithSummary(companyId, limit, offset, sorting, filters);

			Logger.debug("[ReceivableCustomers] Customers fetched successfully", { companyId, count: repoResult.rows.length, totalCount: repoResult.count });

			return ApiResponse.success({ rows: repoResult.rows, count: repoResult.count }, "Customers retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[ReceivableCustomers] Error fetching customers", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve customers");
		}
	}

	static async GetStatement(customerId: UUID, companyId: UUID, startDate?: string, endDate?: string) {
		try {
			Logger.debug("[ReceivableCustomers] Fetching customer statement", {
				customerId,
				companyId,
				startDate,
				endDate,
			});

			if (!customerId) {
				Logger.error("[ReceivableCustomers] Missing customer ID");
				return ApiResponse.error("Customer ID is required");
			}

            const response = await repo.getStatement(customerId, companyId, startDate, endDate);

			if (!response) {
				Logger.error("[ReceivableCustomers] Customer not found", { customerId, companyId });
				return ApiResponse.error("Customer not found");
			}

			Logger.debug("[ReceivableCustomers] Customer statement fetched successfully", {
				customerId,
				companyId,
				debtsCount: response.debts.length,
				paymentsCount: response.payments.length,
			});

			return ApiResponse.success(response, "Customer statement retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[ReceivableCustomers] Error fetching customer statement", {
				customerId,
				companyId,
				error: error.message,
			});
			return ApiResponse.error("Failed to retrieve customer statement");
		}
	}

	static async GetIdAndName(companyId: UUID) {
		try {
			Logger.debug("[ReceivableCustomers] Fetching customer IDs and names", { companyId });

			const result = await ReceivableCustomers.findAll({
				attributes: ["id", "name"],
				where: { company_id: companyId },
			});

			Logger.debug("[ReceivableCustomers] Customer IDs and names fetched successfully", {
				companyId,
				count: result.length,
			});

			if (result.length === 0) {
				Logger.debug("[ReceivableCustomers] No customers found", { companyId });
				return ApiResponse.success([], "No customers found");
			}

			return ApiResponse.success(result, "Customers retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[ReceivableCustomers] Error fetching customer IDs and names", { companyId, error: error.message });
			return ApiResponse.error("Error retrieving customers");
		}
	}

	static async Update(id: UUID, customer: CustomerDto, companyId: UUID) {
		try {
			Logger.info("[ReceivableCustomers] Updating customer", { customerId: id, companyId });

			if (!id) {
				Logger.error("[ReceivableCustomers] Missing customer ID");
				return ApiResponse.error("Customer ID is required");
			}

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

			if (!name || is_company === undefined || is_company === null) {
				Logger.error("[ReceivableCustomers] Missing required fields", { name, is_company });
				return ApiResponse.error("Name and customer type are required");
			}

			const [affectedRows] = await ReceivableCustomers.update(
				{
					name,
					phone: phone || null,
					is_company,
					tax_number: tax_number || null,
					tax_office: tax_office || null,
					mersis_no: mersis_no || null,
					email: email || null,
					address: address || null,
				},
				{
					where: { id, company_id: companyId },
				}
			);

			if (affectedRows === 0) {
				const exists = await ReceivableCustomers.findOne({ where: { id, company_id: companyId } });
				if (!exists) {
					Logger.error("[ReceivableCustomers] Failed to update customer or customer not found", {
						customerId: id,
						companyId,
					});
					return ApiResponse.error("Failed to update customer or customer not found");
				}
			}

			Logger.info("[ReceivableCustomers] Customer updated successfully", { customerId: id, companyId });
			return ApiResponse.success(null, "Customer updated successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[ReceivableCustomers] Error updating customer", {
				customerId: id,
				companyId,
				error: error.message,
			});
			return ApiResponse.error("Error updating customer");
		}
	}

	static async Delete(id: UUID, userId: UUID, companyId: UUID) {
		try {
			Logger.info("[ReceivableCustomers] Deleting customer", { customerId: id, companyId });

			if (!id) {
				Logger.error("[ReceivableCustomers] Missing customer ID");
				return ApiResponse.error("Customer ID is required");
			}

			await ReceivableCustomers.update(
				{ deleted_by: userId },
				{ where: { id, company_id: companyId } }
			);

			const deletedCount = await ReceivableCustomers.destroy({
				where: { id, company_id: companyId },
			});

			if (deletedCount === 0) {
				Logger.error("[ReceivableCustomers] Failed to delete customer or customer not found", {
					customerId: id,
					companyId,
				});
				return ApiResponse.error("Failed to delete customer or customer not found");
			}

			Logger.info("[ReceivableCustomers] Customer deleted successfully", { customerId: id, companyId });
			return ApiResponse.success(null, "Customer deleted successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[ReceivableCustomers] Error deleting customer", {
				customerId: id,
				companyId,
				error: error.message,
			});
			return ApiResponse.error("Error deleting customer");
		}
	}
}
