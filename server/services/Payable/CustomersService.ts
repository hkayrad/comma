import { CustomerDto, CustomerIdName, DebtDto, InsertResult, PaymentDto, UUID } from "@common/types";
import { pool } from "../../lib/db/pool";
import { ApiResponse, Logger } from "../../lib/utils";

export default class PayableCustomersService {
	static async Create(customer: CustomerDto, companyId: UUID) {
		let conn;

		try {
			Logger.info("[PayableCustomers] Creating customer", { companyId, customerName: customer.name });

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

			if (!name || is_company === undefined || is_company === null) {
				Logger.error("[PayableCustomers] Missing required fields", { name, is_company });
				return ApiResponse.error("Name and customer type are required");
			}

			const query = `
                INSERT INTO payable_customers (name, phone, is_company, tax_number, tax_office, mersis_no, email, address, company_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
            `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				name,
				phone || null,
				is_company,
				tax_number || null,
				tax_office || null,
				mersis_no || null,
				email || null,
				address || null,
				companyId,
			])) as InsertResult[];

			Logger.debug("[PayableCustomers] Customer creation result", { result });

			if (!result || result.length === 0) {
				Logger.error("[PayableCustomers] Failed to create customer - no result returned");
				return ApiResponse.error("Failed to create customer");
			}

			Logger.info("[PayableCustomers] Customer created successfully", { customerId: result[0].id, companyId });
			return ApiResponse.success(result[0].id, "Customer created successfully");
		} catch (error: any) {
			Logger.error("[PayableCustomers] Error creating customer", { companyId, error: error.message });
			return ApiResponse.error("Error creating customer");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetAll(companyId: UUID) {
		let conn;

		try {
			Logger.debug("[PayableCustomers] Fetching all customers", { companyId });

			const query = `
                SELECT
                    c.*,
                    COALESCE(debt_summary.total_debt_try, 0) AS total_debt_try,
                    COALESCE(debt_summary.total_debt_usd, 0) AS total_debt_usd,
                    COALESCE(debt_summary.total_debt_eur, 0) AS total_debt_eur,
                    COALESCE(payment_summary.total_payments_try, 0) AS total_payments_try,
                    COALESCE(payment_summary.total_payments_usd, 0) AS total_payments_usd,
                    COALESCE(payment_summary.total_payments_eur, 0) AS total_payments_eur,
                    (COALESCE(debt_summary.total_debt_try, 0) - COALESCE(payment_summary.total_payments_try, 0)) AS remaining_debt_try,
                    (COALESCE(debt_summary.total_debt_usd, 0) - COALESCE(payment_summary.total_payments_usd, 0)) AS remaining_debt_usd,
                    (COALESCE(debt_summary.total_debt_eur, 0) - COALESCE(payment_summary.total_payments_eur, 0)) AS remaining_debt_eur
                FROM payable_customers c
                LEFT JOIN (
                    SELECT
                        customer_id,
                        SUM(CASE WHEN currency = 'TRY' OR currency IS NULL THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_try,
                        SUM(CASE WHEN currency = 'USD' THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_usd,
                        SUM(CASE WHEN currency = 'EUR' THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_eur
                    FROM payable_debts
                    WHERE company_id = ?
                    GROUP BY customer_id
                ) debt_summary ON c.id = debt_summary.customer_id
                LEFT JOIN (
                    SELECT
                        customer_id,
                        SUM(CASE WHEN currency = 'TRY' OR currency IS NULL THEN amount ELSE 0 END) AS total_payments_try,
                        SUM(CASE WHEN currency = 'USD' THEN amount ELSE 0 END) AS total_payments_usd,
                        SUM(CASE WHEN currency = 'EUR' THEN amount ELSE 0 END) AS total_payments_eur
                    FROM payable_payments
                    WHERE company_id = ?
                    GROUP BY customer_id
                ) payment_summary ON c.id = payment_summary.customer_id
                WHERE c.company_id = ?
                ORDER BY c.created_at DESC
            `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [companyId, companyId, companyId])) as CustomerDto[];

			Logger.debug("[PayableCustomers] Customers fetched successfully", { companyId, count: result.length });

			if (result.length === 0) {
				Logger.debug("[PayableCustomers] No customers found", { companyId });
				return ApiResponse.success([], "No customers found");
			}

			return ApiResponse.success(result, "Customers retrieved successfully");
		} catch (error: any) {
			Logger.error("[PayableCustomers] Error fetching customers", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve customers");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetStatement(customerId: UUID, companyId: UUID) {
		let conn;

		try {
			Logger.debug("[PayableCustomers] Fetching customer statement", { customerId, companyId });

			if (!customerId) {
				Logger.error("[PayableCustomers] Missing customer ID");
				return ApiResponse.error("Customer ID is required");
			}

			conn = await pool.getConnection();

			const customerQuery = `
                SELECT
                    c.*,
                    COALESCE(debt_summary.total_debt_try, 0) AS total_debt_try,
                    COALESCE(debt_summary.total_debt_usd, 0) AS total_debt_usd,
                    COALESCE(debt_summary.total_debt_eur, 0) AS total_debt_eur,
                    COALESCE(payment_summary.total_payments_try, 0) AS total_payments_try,
                    COALESCE(payment_summary.total_payments_usd, 0) AS total_payments_usd,
                    COALESCE(payment_summary.total_payments_eur, 0) AS total_payments_eur,
                    (COALESCE(debt_summary.total_debt_try, 0) - COALESCE(payment_summary.total_payments_try, 0)) AS remaining_debt_try,
                    (COALESCE(debt_summary.total_debt_usd, 0) - COALESCE(payment_summary.total_payments_usd, 0)) AS remaining_debt_usd,
                    (COALESCE(debt_summary.total_debt_eur, 0) - COALESCE(payment_summary.total_payments_eur, 0)) AS remaining_debt_eur
                FROM payable_customers c
                LEFT JOIN (
                    SELECT
                        customer_id,
                        SUM(CASE WHEN currency = 'TRY' OR currency IS NULL THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_try,
                        SUM(CASE WHEN currency = 'USD' THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_usd,
                        SUM(CASE WHEN currency = 'EUR' THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_eur
                    FROM payable_debts
                    WHERE company_id = ?
                    GROUP BY customer_id
                ) debt_summary ON c.id = debt_summary.customer_id
                LEFT JOIN (
                    SELECT
                        customer_id,
                        SUM(CASE WHEN currency = 'TRY' OR currency IS NULL THEN amount ELSE 0 END) AS total_payments_try,
                        SUM(CASE WHEN currency = 'USD' THEN amount ELSE 0 END) AS total_payments_usd,
                        SUM(CASE WHEN currency = 'EUR' THEN amount ELSE 0 END) AS total_payments_eur
                    FROM payable_payments
                    WHERE company_id = ?
                    GROUP BY customer_id
                ) payment_summary ON c.id = payment_summary.customer_id
                WHERE c.id = ? AND c.company_id = ?
            `;

			const customerResult = (await conn.query(customerQuery, [
				companyId,
				companyId,
				customerId,
				companyId,
			])) as CustomerDto[];

			if (customerResult.length === 0) {
				Logger.error("[PayableCustomers] Customer not found", { customerId, companyId });
				return ApiResponse.error("Customer not found");
			}

			const debtsQuery = `
                SELECT
                    d.id,
                    d.invoice_no,
                    d.amount,
                    d.vat,
                    (d.amount + d.vat) AS total_amount,
                    d.description,
                    d.issue_date,
                    d.created_at
                FROM payable_debts d
                WHERE d.customer_id = ? AND d.company_id = ?
                ORDER BY d.issue_date DESC, d.created_at DESC
            `;

			const paymentsQuery = `
                SELECT
                    p.id,
                    p.invoice_no,
                    p.amount,
                    p.payment_method,
                    p.description,
                    p.payment_date,
                    p.created_at
                FROM payable_payments p
                WHERE p.customer_id = ? AND p.company_id = ?
                ORDER BY p.payment_date DESC, p.created_at DESC
            `;

			const [debtsResult, paymentsResult] = await Promise.all([
				conn.query(debtsQuery, [customerId, companyId]) as Promise<DebtDto[]>,
				conn.query(paymentsQuery, [customerId, companyId]) as Promise<PaymentDto[]>,
			]);

			Logger.debug("[PayableCustomers] Customer statement fetched successfully", {
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
			Logger.error("[PayableCustomers] Error fetching customer statement", {
				customerId,
				companyId,
				error: error.message,
			});
			return ApiResponse.error("Failed to retrieve customer statement");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetIdAndName(companyId: UUID) {
		let conn;

		try {
			Logger.debug("[PayableCustomers] Fetching customer IDs and names", { companyId });

			const query = `
                SELECT id, name FROM payable_customers WHERE company_id = ?
            `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [companyId])) as CustomerIdName[];

			Logger.debug("[PayableCustomers] Customer IDs and names fetched successfully", {
				companyId,
				count: result.length,
			});

			if (result.length === 0) {
				Logger.debug("[PayableCustomers] No customers found", { companyId });
				return ApiResponse.success([], "No customers found");
			}

			return ApiResponse.success(result, "Customers retrieved successfully");
		} catch (error: any) {
			Logger.error("[PayableCustomers] Error fetching customer IDs and names", { companyId, error: error.message });
			return ApiResponse.error("Error retrieving customers");
		} finally {
			if (conn) conn.release();
		}
	}

	static async Update(id: UUID, customer: CustomerDto, companyId: UUID) {
		let conn;

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

			const query = `
                UPDATE payable_customers
                SET name = ?, phone = ?, is_company = ?, tax_number = ?, tax_office = ?, mersis_no = ?, email = ?, address = ?
                WHERE id = ? AND company_id = ?
            `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				name,
				phone || null,
				is_company,
				tax_number || null,
				tax_office || null,
				mersis_no || null,
				email || null,
				address || null,
				id,
				companyId,
			])) as { affectedRows: number };

			Logger.debug("[PayableCustomers] Customer update result", { customerId: id, affectedRows: result.affectedRows });

			if (result.affectedRows === 0) {
				Logger.error("[PayableCustomers] Failed to update customer or customer not found", {
					customerId: id,
					companyId,
				});
				return ApiResponse.error("Failed to update customer or customer not found");
			}

			Logger.info("[PayableCustomers] Customer updated successfully", { customerId: id, companyId });
			return ApiResponse.success(null, "Customer updated successfully");
		} catch (error: any) {
			Logger.error("[PayableCustomers] Error updating customer", { customerId: id, companyId, error: error.message });
			return ApiResponse.error("Error updating customer");
		} finally {
			if (conn) conn.release();
		}
	}

	static async Delete(id: UUID, companyId: UUID) {
		let conn;

		try {
			Logger.info("[PayableCustomers] Deleting customer", { customerId: id, companyId });

			if (!id) {
				Logger.error("[PayableCustomers] Missing customer ID");
				return ApiResponse.error("Customer ID is required");
			}

			const query = `
                DELETE FROM payable_customers WHERE id = ? AND company_id = ?
            `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [id, companyId])) as { affectedRows: number };

			Logger.debug("[PayableCustomers] Customer deletion result", {
				customerId: id,
				affectedRows: result.affectedRows,
			});

			if (result.affectedRows === 0) {
				Logger.error("[PayableCustomers] Failed to delete customer or customer not found", {
					customerId: id,
					companyId,
				});
				return ApiResponse.error("Failed to delete customer or customer not found");
			}

			Logger.info("[PayableCustomers] Customer deleted successfully", { customerId: id, companyId });
			return ApiResponse.success(null, "Customer deleted successfully");
		} catch (error: any) {
			Logger.error("[PayableCustomers] Error deleting customer", { customerId: id, companyId, error: error.message });
			return ApiResponse.error("Error deleting customer");
		} finally {
			if (conn) conn.release();
		}
	}
}
