import { CustomerDto, CustomerIdName, DebtDto, InsertResult, PaymentDto, UUID } from "@common/types";
import { pool } from "../../lib/db/pool";
import { ApiResponse, Logger } from "../../lib/utils";

export default class ReceivableCustomersService {
	static async Create(customer: CustomerDto, userId: UUID, companyId: UUID) {
		let conn;

		try {
			Logger.info("[ReceivableCustomers] Creating customer", { companyId, customerName: customer.name, userId });

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

			if (!name || is_company === undefined || is_company === null) {
				Logger.error("[ReceivableCustomers] Missing required fields", { name, is_company });
				return ApiResponse.error("Name and customer type are required");
			}

			const query = `
                INSERT INTO receivable_customers (name, phone, is_company, tax_number, tax_office, mersis_no, email, address, company_id, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
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
				userId,
			])) as InsertResult[];

			Logger.debug("[ReceivableCustomers] Customer creation result", { result });

			if (!result || result.length === 0) {
				Logger.error("[ReceivableCustomers] Failed to create customer - no result returned");
				return ApiResponse.error("Failed to create customer");
			}

			Logger.info("[ReceivableCustomers] Customer created successfully", { customerId: result[0].id, companyId });
			return ApiResponse.success(result[0].id, "Customer created successfully");
		} catch (error: any) {
			Logger.error("[ReceivableCustomers] Error creating customer", { companyId, error: error.message });
			return ApiResponse.error("Error creating customer");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetAll(companyId: UUID) {
		let conn;

		try {
			Logger.debug("[ReceivableCustomers] Fetching all customers", { companyId });

			const query = `
				WITH debt_summary AS (
			    SELECT
			      customer_id,
			      SUM(total_in_try) AS total_debt
			    FROM receivable_debts
			    WHERE company_id = ?
		        AND deleted_at IS NULL
		        AND deleted_by IS NULL
			    GROUP BY customer_id
				),
				payment_summary AS (
			    SELECT
			      customer_id,
			      SUM(amount_in_try) AS total_payments
			    FROM receivable_payments
			    WHERE company_id = ?
		        AND deleted_at IS NULL
		        AND deleted_by IS NULL
			    GROUP BY customer_id
				)
				SELECT
			    c.*,
			    COALESCE(debt_summary.total_debt, 0) AS total_debt,
			    COALESCE(payment_summary.total_payments, 0) AS total_payments,
			    COALESCE(debt_summary.total_debt, 0) - COALESCE(payment_summary.total_payments, 0) AS remaining_debt
				FROM receivable_customers c
				LEFT JOIN debt_summary ON c.id = debt_summary.customer_id
				LEFT JOIN payment_summary ON c.id = payment_summary.customer_id
				WHERE c.company_id = ?
			    AND c.deleted_at IS NULL
			    AND c.deleted_by IS NULL
				ORDER BY c.created_at DESC;
      `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [companyId, companyId, companyId])) as CustomerDto[];

			Logger.debug("[ReceivableCustomers] Customers fetched successfully", { companyId, count: result.length });

			if (result.length === 0) {
				Logger.debug("[ReceivableCustomers] No customers found", { companyId });
				return ApiResponse.success([], "No customers found");
			}

			return ApiResponse.success(result, "Customers retrieved successfully");
		} catch (error: any) {
			Logger.error("[ReceivableCustomers] Error fetching customers", { companyId, error: error.message });
			return ApiResponse.error("Failed to retrieve customers");
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetStatement(customerId: UUID, companyId: UUID, startDate?: string, endDate?: string) {
		let conn;

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

			conn = await pool.getConnection();

			const customerQuery = `
				WITH debt_summary AS (
					SELECT
						customer_id,
						SUM(total_in_try) AS total_debt
					FROM receivable_debts
					WHERE customer_id = ?
						AND company_id = ?
						AND deleted_at IS NULL
						AND deleted_by IS NULL
					GROUP BY customer_id
				),
				payment_summary AS (
					SELECT
						customer_id,
						SUM(amount_in_try) AS total_payments
					FROM receivable_payments
					WHERE customer_id = ?
						AND company_id = ?
						AND deleted_at IS NULL
						AND deleted_by IS NULL
					GROUP BY customer_id
				)
				SELECT
					c.*,
					COALESCE(ds.total_debt, 0) AS total_debt,
					COALESCE(ps.total_payments, 0) AS total_payments,
					COALESCE(ds.total_debt, 0) - COALESCE(ps.total_payments, 0) AS remaining_debt
				FROM receivable_customers c
				LEFT JOIN debt_summary ds ON c.id = ds.customer_id
				LEFT JOIN payment_summary ps ON c.id = ps.customer_id
				WHERE c.id = ?
					AND c.company_id = ?
					AND c.deleted_at IS NULL
					AND c.deleted_by IS NULL;
			`;

			const customerResult = (await conn.query(customerQuery, [
				customerId,
				companyId,
				customerId,
				companyId,
				customerId,
				companyId,
			])) as CustomerDto[];

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
          AND d.deleted_by IS NULL
          AND c.deleted_at IS NULL
          AND c.deleted_by IS NULL
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
        AND p.deleted_by IS NULL
        AND c.deleted_at IS NULL
        AND c.deleted_by IS NULL
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
				conn.query(debtsQuery, debtParams) as Promise<DebtDto[]>,
				conn.query(paymentsQuery, paymentParams) as Promise<PaymentDto[]>,
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
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetIdAndName(companyId: UUID) {
		let conn;

		try {
			Logger.debug("[ReceivableCustomers] Fetching customer IDs and names", { companyId });

			const query = `
                SELECT id, name FROM receivable_customers WHERE company_id = ? AND deleted_at IS NULL AND deleted_by IS NULL
            `;

			conn = await pool.getConnection();
			const result = (await conn.query(query, [companyId])) as CustomerIdName[];

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
		} finally {
			if (conn) conn.release();
		}
	}

	static async Update(id: UUID, customer: CustomerDto, companyId: UUID) {
		let conn;

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

			const query = `
                UPDATE receivable_customers
                SET name = ?, phone = ?, is_company = ?, tax_number = ?, tax_office = ?, mersis_no = ?, email = ?, address = ?
                WHERE id = ? AND company_id = ? AND deleted_at IS NULL AND deleted_by IS NULL
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

			Logger.debug("[ReceivableCustomers] Customer update result", {
				customerId: id,
				affectedRows: result.affectedRows,
			});

			if (result.affectedRows === 0) {
				Logger.error("[ReceivableCustomers] Failed to update customer or customer not found", {
					customerId: id,
					companyId,
				});
				return ApiResponse.error("Failed to update customer or customer not found");
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
		} finally {
			if (conn) conn.release();
		}
	}

	static async Delete(id: UUID, userId: UUID, companyId: UUID) {
		let conn;

		try {
			Logger.info("[ReceivableCustomers] Deleting customer", { customerId: id, companyId });

			if (!id) {
				Logger.error("[ReceivableCustomers] Missing customer ID");
				return ApiResponse.error("Customer ID is required");
			}

			const query = `
				UPDATE receivable_customers
        SET deleted_at = CURRENT_TIMESTAMP(), deleted_by = ?
        WHERE id = ? AND company_id = ? AND deleted_at IS NULL AND deleted_by IS NULL
      `;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [userId, id, companyId])) as { affectedRows: number };

			Logger.debug("[ReceivableCustomers] Customer deletion result", {
				customerId: id,
				affectedRows: result.affectedRows,
			});

			if (result.affectedRows === 0) {
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
		} finally {
			if (conn) conn.release();
		}
	}
}
