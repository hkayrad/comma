import { pool } from "../utils/db/pool";
import { ApiResponse } from "../utils";

export class CustomersService {
    static async GetAll(req: any, res: any) {
        let conn;

        try {
            const query = `
            SELECT 
                c.id,
                c.name,
                c.phone,
                c.is_company,
                c.tax_number,
                c.email,
                c.address,
                COALESCE(d.total_debt, 0) AS total_debt,
                COALESCE(d.total_vat, 0) AS total_vat,
                COALESCE(p.total_payment, 0) AS total_payment
            FROM customers c
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(amount) AS total_debt,
                    SUM(vat) AS total_vat
                FROM debts
                GROUP BY customer_id
            ) d ON c.id = d.customer_id
            LEFT JOIN (
                SELECT 
                    customer_id,
                    SUM(amount) AS total_payment
                FROM payments
                GROUP BY customer_id
            ) p ON c.id = p.customer_id
            `;

            conn = await pool.getConnection();
            const rows = await conn.query(query);

            if (rows.length === 0)
                return ApiResponse.success([], "No customers found");

            return ApiResponse.success(rows, "Customers retrieved successfully");

        } catch (error) {
            console.error('Error fetching customers with debts:', error);
            return ApiResponse.error("Error fetching customers");
        } finally {
            if (conn) conn.release();
        }
    }

    static async GetCustomerNamesAndIds(req: any, res: any) {
        let conn;

        try {
            const query = `
            SELECT id, name FROM customers
            `;

            conn = await pool.getConnection();
            const rows = await conn.query(query);

            if (rows.length === 0)
                return ApiResponse.success([], "No customers found");

            return ApiResponse.success(rows, "Customer names and IDs retrieved successfully");

        } catch (error) {
            console.error('Error fetching customer names and IDs:', error);
            return ApiResponse.error("Error fetching customer names and IDs");
        } finally {
            if (conn) conn.release();
        }
    }
}