import { CustomerDto, CustomerIdName, DebtDto, PaymentDto, UUID } from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { ReceivableCustomers } from "../../models";
import { sequelize } from "../../lib/db/sequelize";
import { QueryTypes } from "sequelize";

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
		} catch (error: any) {
			Logger.error("[ReceivableCustomers] Error creating customer", { companyId, error: error.message });
			return ApiResponse.error("Error creating customer");
		}
	}

	static async GetAll(companyId: UUID) {
		try {
			Logger.debug("[ReceivableCustomers] Fetching all customers", { companyId });

			const query = `
				SELECT
			    c.*,
			    COALESCE(d.total_debt, 0) AS total_debt,
			    COALESCE(p.total_payments, 0) AS total_payments,
			    COALESCE(d.total_debt, 0) - COALESCE(p.total_payments, 0) AS remaining_debt
				FROM receivable_customers c
				-- Join Receivable Debt View
				LEFT JOIN vw_receivable_debt_summary d
			    ON c.id = d.customer_id
			    AND c.company_id = d.company_id
				-- Join Receivable Payment View
				LEFT JOIN vw_receivable_payment_summary p
			    ON c.id = p.customer_id
			    AND c.company_id = p.company_id
				WHERE c.company_id = ?
			    AND c.deleted_at IS NULL
				ORDER BY c.created_at DESC;
      `;

			const result = (await sequelize.query(query, {
				replacements: [companyId],
				type: QueryTypes.SELECT,
			})) as CustomerDto[];

			Logger.debug("[ReceivableCustomers] Customers fetched successfully", { companyId, count: result.length });

			if (result.length === 0) {
				Logger.debug("[ReceivableCustomers] No customers found", { companyId });
				return ApiResponse.success([], "No customers found");
			}

			return ApiResponse.success(result, "Customers retrieved successfully");
		} catch (error: any) {
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

			const customerQuery = `
				SELECT
			    c.*,
			    COALESCE(ds.total_debt, 0) AS total_debt,
			    COALESCE(ps.total_payments, 0) AS total_payments,
			    COALESCE(ds.total_debt, 0) - COALESCE(ps.total_payments, 0) AS remaining_debt
				FROM receivable_customers c
				-- Join Receivable Debt View
				LEFT JOIN vw_receivable_debt_summary ds
			    ON c.id = ds.customer_id
			    AND c.company_id = ds.company_id
				-- Join Receivable Payment View
				LEFT JOIN vw_receivable_payment_summary ps
			    ON c.id = ps.customer_id
			    AND c.company_id = ps.company_id
				WHERE c.id = ?
				  AND c.company_id = ?
				  AND c.deleted_at IS NULL;
			`;

			const customerResult = (await sequelize.query(customerQuery, {
				replacements: [customerId, companyId],
				type: QueryTypes.SELECT,
			})) as CustomerDto[];

			if (customerResult.length === 0) {
				Logger.error("[ReceivableCustomers] Customer not found", { customerId, companyId });
				return ApiResponse.error("Customer not found");
			}

			let debtsQuery = `
				SELECT
          d.id,
          d.invoice_no,
          d.amount,
          d.vat,
          d.currency,
          d.exchange_rate,
          d.total,
          d.total_in_try,
          d.description,
          d.issue_date,
          d.created_at
		    FROM receivable_debts d
		    INNER JOIN receivable_customers c ON d.customer_id = c.id AND d.company_id = c.company_id
		    WHERE d.customer_id = ?
          AND d.company_id = ?
          AND d.deleted_at IS NULL
          AND c.deleted_at IS NULL
      `;

			const debtParams: any[] = [customerId, companyId];

			if (startDate) {
				debtsQuery += ` AND d.issue_date >= ?`;
				debtParams.push(startDate);
			}

			if (endDate) {
				debtsQuery += ` AND d.issue_date <= ?`;
				debtParams.push(endDate);
			}

			debtsQuery += ` ORDER BY d.issue_date DESC, d.created_at DESC`;

			let paymentsQuery = `
				 SELECT
	        p.id,
	        p.invoice_no,
	        p.amount,
	        p.currency,
	        p.exchange_rate,
	        p.amount_in_try,
	        p.payment_method,
	        p.description,
	        p.payment_date,
	        p.created_at
		    FROM receivable_payments p
		    INNER JOIN receivable_customers c ON p.customer_id = c.id AND p.company_id = c.company_id
		    WHERE p.customer_id = ?
	        AND p.company_id = ?
	        AND p.deleted_at IS NULL
	        AND c.deleted_at IS NULL
      `;

			const paymentParams: any[] = [customerId, companyId];

			if (startDate) {
				paymentsQuery += ` AND p.payment_date >= ?`;
				paymentParams.push(startDate);
			}

			if (endDate) {
				paymentsQuery += ` AND p.payment_date <= ?`;
				paymentParams.push(endDate);
			}

			paymentsQuery += ` ORDER BY p.payment_date DESC, p.created_at DESC`;

			const [debtsResult, paymentsResult] = await Promise.all([
				sequelize.query(debtsQuery, { replacements: debtParams, type: QueryTypes.SELECT }) as Promise<DebtDto[]>,
				sequelize.query(paymentsQuery, { replacements: paymentParams, type: QueryTypes.SELECT }) as Promise<PaymentDto[]>,
			]);

			Logger.debug("[ReceivableCustomers] Customer statement fetched successfully", {
				customerId,
				companyId,
				debtsCount: debtsResult.length,
				paymentsCount: paymentsResult.length,
			});

			const response = {
				customer: customerResult[0],
				debts: debtsResult,
				payments: paymentsResult,
			};

			return ApiResponse.success(response, "Customer statement retrieved successfully");
		} catch (error: any) {
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
		} catch (error: any) {
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
		} catch (error: any) {
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
		} catch (error: any) {
			Logger.error("[ReceivableCustomers] Error deleting customer", {
				customerId: id,
				companyId,
				error: error.message,
			});
			return ApiResponse.error("Error deleting customer");
		}
	}
}
