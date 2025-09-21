import { pool } from "../utils/db/pool";
import { ApiResponse, Logger } from "../utils";

export class CustomersService {
    static async GetAll() {
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

    static async GetCustomerNamesAndIds() {
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

    static async Create(customer: any) {
        let conn;

        try {
            const { name, phone, is_company, tax_number, email, address } = customer;

            if (!name) {
                return ApiResponse.error("Name is required");
            }

            const query = `
            INSERT INTO customers (name, phone, is_company, tax_number, email, address)
            VALUES (?, ?, ?, ?, ?, ?) RETURNING id
            `;

            conn = await pool.getConnection();
            const result = await conn.query(query, [name, phone, is_company || false, tax_number || null, email || null, address || null]);
            Logger.log('Customer creation result:', result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to create customer");

            return ApiResponse.success({ id: result.insertId }, "Customer created successfully");

        } catch (error) {
            console.error('Error creating customer:', error);
            return ApiResponse.error("Error creating customer");
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
            Logger.log('Customer deletion result:', result);

            if (result.affectedRows === 0)
                return ApiResponse.error("No customer found with the given ID");

            return ApiResponse.success(null, "Customer deleted successfully");

        } catch (error) {
            console.error('Error deleting customer:', error);
            return ApiResponse.error("Error deleting customer");
        } finally {
            if (conn) conn.release();
        }
    }

    static async Update(customer: any) {
        let conn;

        try {
            const { id, name, phone, is_company, tax_number, email, address } = customer;

            if (!id) {
                return ApiResponse.error("Customer ID is required");
            }

            if (!name) {
                return ApiResponse.error("Name is required");
            }

            Logger.log('Updating customer with data:', customer);

            const query = `
            UPDATE customers 
            SET name = ?, phone = ?, is_company = ?, tax_number = ?, email = ?, address = ?
            WHERE id = ?
            `;

            conn = await pool.getConnection();
            const result = await conn.query(query, [name, phone || null, is_company || false, tax_number || null, email || null, address || null, id]);
            Logger.log('Customer update result:', result);

            if (result.affectedRows === 0) {
                return ApiResponse.error("No customer found with the given ID");
            }

            return ApiResponse.success(null, "Customer updated successfully");

        } catch (error) {
            console.error('Error updating customer:', error);
            return ApiResponse.error("Error updating customer");
        } finally {
            if (conn) conn.release();
        }
    }
}