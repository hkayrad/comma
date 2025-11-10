import { pool } from "../../utils/db/pool";
import { ApiResponse, Logger } from "../../utils";

export default class ReceivableCustomersService {
    static async Create(customer: any, companyId: string) {
        let conn;

        try {
            const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

            if (!name || is_company === undefined || is_company === null) {
                return ApiResponse.error("Name and customer type are required");
            }

            const query = `
            INSERT INTO receivable_customers (name, phone, is_company, tax_number, tax_office, mersis_no, email, address, company_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [name, phone, is_company || false, tax_number || null, tax_office || null, mersis_no || null, email || null, address || null, companyId]);
            Logger.info("Customer creation result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to create customer");

            return ApiResponse.success(result[0].id, "Customer created successfully");

        } catch (error) {
            Logger.error('Error creating customer:', error);
            return ApiResponse.error("Error creating customer");
        } finally {
            if (conn) conn.release();
        }
    }

    static async GetAll(companyId: string) {
        let conn;

        try {
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
            FROM receivable_customers c
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(CASE WHEN currency = 'TRY' OR currency IS NULL THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_try,
                    SUM(CASE WHEN currency = 'USD' THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_usd,
                    SUM(CASE WHEN currency = 'EUR' THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_eur
                FROM receivable_debts
                WHERE company_id = ?
                GROUP BY customer_id
            ) debt_summary ON c.id = debt_summary.customer_id
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(CASE WHEN currency = 'TRY' OR currency IS NULL THEN amount ELSE 0 END) AS total_payments_try,
                    SUM(CASE WHEN currency = 'USD' THEN amount ELSE 0 END) AS total_payments_usd,
                    SUM(CASE WHEN currency = 'EUR' THEN amount ELSE 0 END) AS total_payments_eur
                FROM receivable_payments
                WHERE company_id = ?
                GROUP BY customer_id
            ) payment_summary ON c.id = payment_summary.customer_id
            WHERE company_id = ?
            ORDER BY c.created_at DESC
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [companyId, companyId, companyId]);
            Logger.info("Retrieved receivable_customers:", result);

            if (result.length === 0)
                return ApiResponse.error("No receivable_customers found");

            return ApiResponse.success(result, "Customers retrieved successfully");
        } catch (error) {
            Logger.error("Failed to retrieve receivable_customers:", error);
            return ApiResponse.error("Failed to retrieve receivable_customers");
        } finally {
            if (conn) conn.release();
        }
    }

    static async GetStatement(customerId: string, companyId: string) {
        let conn;

        try {
            if (!customerId) {
                return ApiResponse.error("Customer ID is required");
            }

            conn = await pool.getConnection();

            // Get customer base info with aggregates
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
            FROM receivable_customers c
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(CASE WHEN currency = 'TRY' OR currency IS NULL THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_try,
                    SUM(CASE WHEN currency = 'USD' THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_usd,
                    SUM(CASE WHEN currency = 'EUR' THEN amount + COALESCE(vat, 0) ELSE 0 END) AS total_debt_eur
                FROM receivable_debts
                WHERE company_id = ?
                GROUP BY customer_id
            ) debt_summary ON c.id = debt_summary.customer_id
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(CASE WHEN currency = 'TRY' OR currency IS NULL THEN amount ELSE 0 END) AS total_payments_try,
                    SUM(CASE WHEN currency = 'USD' THEN amount ELSE 0 END) AS total_payments_usd,
                    SUM(CASE WHEN currency = 'EUR' THEN amount ELSE 0 END) AS total_payments_eur
                FROM receivable_payments
                WHERE company_id = ?
                GROUP BY customer_id
            ) payment_summary ON c.id = payment_summary.customer_id
            WHERE c.id = ? AND c.company_id = ?
            `;

            const customerResult = await conn.query(customerQuery, [companyId, companyId, customerId, companyId]);
            if (customerResult.length === 0) {
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
            FROM receivable_debts d
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
            FROM receivable_payments p
            WHERE p.customer_id = ? AND p.company_id = ?
            ORDER BY p.payment_date DESC, p.created_at DESC
            `;

            const [debtsResult, paymentsResult] = await Promise.all([
                conn.query(debtsQuery, [customerId, companyId]),
                conn.query(paymentsQuery, [customerId, companyId])
            ]);

            const response = {
                customer: customerResult[0],
                debts: debtsResult,
                payments: paymentsResult
            };

            return ApiResponse.success(response, "Customer statement retrieved successfully");
        } catch (error) {
            Logger.error("Failed to retrieve customer statement:", error);
            return ApiResponse.error("Failed to retrieve customer statement");
        } finally {
            if (conn) conn.release();
        }
    }

    static async GetIdAndName(companyId: string) {
        let conn;

        try {
            const query = `
            SELECT id, name FROM receivable_customers WHERE company_id = ?
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [companyId]);
            Logger.info("Retrieved receivable_customers:", result);


            if (result.length === 0)
                return ApiResponse.error("No receivable_customers found");

            return ApiResponse.success(result, "Customers retrieved successfully");

        } catch (error) {
            Logger.error('Error retrieving receivable_customers:', error);
            return ApiResponse.error("Error retrieving receivable_customers");
        } finally {
            if (conn) conn.release();
        }
    }

    static async Update(id: string, customer: any, companyId: string) {
        let conn;

        try {
            if (!id) {
                return ApiResponse.error("Customer ID is required");
            }

            const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

            if (!name || is_company === undefined || is_company === null) {
                return ApiResponse.error("Name and customer type are required");
            }

            const query = `
            UPDATE receivable_customers 
            SET name = ?, phone = ?, is_company = ?, tax_number = ?, tax_office = ?, mersis_no = ?, email = ?, address = ?
            WHERE id = ? AND company_id = ?
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [name, phone, is_company || false, tax_number || null, tax_office || null, mersis_no || null, email || null, address || null, id, companyId]);
            Logger.info("Customer update result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to update customer or customer not found");

            return ApiResponse.success(result[0], "Customer updated successfully");

        } catch (error) {
            Logger.error('Error updating customer:', error);
            return ApiResponse.error("Error updating customer");
        } finally {
            if (conn) conn.release();
        }
    }

    static async Delete(id: string, companyId: string) {
        let conn;

        try {
            if (!id) {
                return ApiResponse.error("Customer ID is required");
            }

            const query = `
            DELETE FROM receivable_customers WHERE id = ?
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [id, companyId]);
            Logger.info("Customer deletion result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to delete customer or customer not found");

            return ApiResponse.success(null, "Customer deleted successfully");

        } catch (error) {
            Logger.error('Error deleting customer:', error);
            return ApiResponse.error("Error deleting customer");
        } finally {
            if (conn) conn.release();
        }
    }
}