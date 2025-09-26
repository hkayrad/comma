import { pool } from "../utils/db/pool";
import { ApiResponse, Logger } from "../utils";

export class CustomersService {
    static async Create(customer: any) {
        let conn;

        try {
            const { name, phone, is_company, tax_number, email, address } = customer;

            if (!name || is_company === undefined || is_company === null) {
                return ApiResponse.error("Name and customer type are required");
            }

            const query = `
            INSERT INTO customers (name, phone, is_company, tax_number, email, address)
            VALUES (?, ?, ?, ?, ?, ?) RETURNING id
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [name, phone, is_company || false, tax_number || null, email || null, address || null]);
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
            FROM customers c
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(amount + COALESCE(vat, 0)) AS total_debt
                FROM debts
                GROUP BY customer_id
            ) debt_summary ON c.id = debt_summary.customer_id
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(amount) AS total_payments
                FROM payments
                GROUP BY customer_id
            ) payment_summary ON c.id = payment_summary.customer_id
            ORDER BY c.created_at DESC
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query);
            Logger.info("Retrieved customers:", result);

            if (result.length === 0)
                return ApiResponse.error("No customers found");

            return ApiResponse.success(result, "Customers retrieved successfully");
        } catch (error) {
            Logger.error("Failed to retrieve customers:", error);
            return ApiResponse.error("Failed to retrieve customers");
        } finally {
            if (conn) conn.release();
        }
    }

    static async GetIdAndName() {
        let conn;

        try {
            const query = `
            SELECT id, name FROM customers
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query);
            Logger.info("Retrieved customers:", result);


            if (result.length === 0)
                return ApiResponse.error("No customers found");

            return ApiResponse.success(result, "Customers retrieved successfully");

        } catch (error) {
            Logger.error('Error retrieving customers:', error);
            return ApiResponse.error("Error retrieving customers");
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
            DELETE FROM customers WHERE id = ?
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