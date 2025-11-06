import { pool } from "../../utils/db/pool";
import { ApiResponse, Logger } from "../../utils";

export default class ReceivableCustomersService {
    static async Create(customer: any) {
        let conn;

        try {
            const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = customer;

            if (!name || is_company === undefined || is_company === null) {
                return ApiResponse.error("Name and customer type are required");
            }

            const query = `
            INSERT INTO receivable_customers (name, phone, is_company, tax_number, tax_office, mersis_no, email, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [name, phone, is_company || false, tax_number || null, tax_office || null, mersis_no || null, email || null, address || null]);
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

    static async GetAll() {
        let conn;

        try {
            const query = `
            SELECT
                c.*,
                COALESCE(debt_summary.total_debt, 0) AS total_debt,
                COALESCE(payment_summary.total_payments, 0) AS total_payments,
                (COALESCE(debt_summary.total_debt, 0) - COALESCE(payment_summary.total_payments, 0)) AS remaining_debt
            FROM receivable_customers c
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(amount + COALESCE(vat, 0)) AS total_debt
                FROM receivable_debts
                GROUP BY customer_id
            ) debt_summary ON c.id = debt_summary.customer_id
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(amount) AS total_payments
                FROM receivable_payments
                GROUP BY customer_id
            ) payment_summary ON c.id = payment_summary.customer_id
            ORDER BY c.created_at DESC
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query);
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

    static async GetStatement(customerId: string) {
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
                COALESCE(debt_summary.total_debt, 0) AS total_debt,
                COALESCE(payment_summary.total_payments, 0) AS total_payments,
                (COALESCE(debt_summary.total_debt, 0) - COALESCE(payment_summary.total_payments, 0)) AS remaining_debt
            FROM receivable_customers c
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(amount + COALESCE(vat, 0)) AS total_debt
                FROM receivable_debts
                GROUP BY customer_id
            ) debt_summary ON c.id = debt_summary.customer_id
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(amount) AS total_payments
                FROM receivable_payments
                GROUP BY customer_id
            ) payment_summary ON c.id = payment_summary.customer_id
            WHERE c.id = ?
            `;

            const customerResult = await conn.query(customerQuery, [customerId]);
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
            WHERE d.customer_id = ?
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
            WHERE p.customer_id = ?
            ORDER BY p.payment_date DESC, p.created_at DESC
            `;

            const [debtsResult, paymentsResult] = await Promise.all([
                conn.query(debtsQuery, [customerId]),
                conn.query(paymentsQuery, [customerId])
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

    static async GetIdAndName() {
        let conn;

        try {
            const query = `
            SELECT id, name FROM receivable_customers
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query);
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

    static async Update(id: string, customer: any) {
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
            WHERE id = ?
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [name, phone, is_company || false, tax_number || null, tax_office || null, mersis_no || null, email || null, address || null, id]);
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

    static async Delete(id: string) {
        let conn;

        try {
            if (!id) {
                return ApiResponse.error("Customer ID is required");
            }

            const query = `
            DELETE FROM receivable_customers WHERE id = ?
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [id]);
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