import { pool } from "../utils/db/pool";
import { ApiResponse, Logger } from "../utils";

export class DebtsService {
    static async GetAll() {
        let conn;

        try {
            const query = `
            SELECT d.*, c.name AS customer_name FROM debts d
            JOIN customers c ON d.customer_id = c.id ORDER BY d.issue_date DESC
            `;

            conn = await pool.getConnection();
            const rows = await conn.query(query);

            if (rows.length === 0)
                return ApiResponse.success([], "No debts found");

            return ApiResponse.success(rows, "Debts retrieved successfully");

        } catch (error) {
            console.error('Error fetching debts:', error);
            return ApiResponse.error("Error fetching debts");
        } finally {
            if (conn) conn.release();
        }
    }

    static async Create(debt: any) {
        let conn;

        try {
            const { customer_id, amount, invoice_no, vat, description, issue_date } = debt;

            if (!customer_id || !amount || !vat || !issue_date) {
                return ApiResponse.error("Missing required fields");
            }

            Logger.log("Creating debt with data:", debt);
            const query = `
            INSERT INTO debts (customer_id, amount, invoice_no, vat, description, issue_date)
            VALUES (?, ?, ?, ?, ?, ?) RETURNING id
            `;

            conn = await pool.getConnection();
            
            const result = await conn.query(query, [
                customer_id,
                amount,
                invoice_no || null,
                vat,
                description || null,
                issue_date
            ]);
            Logger.log("Debt creation result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to create debt");

            return ApiResponse.success({ id: result.insertId }, "Debt created successfully");
        } catch (error) {
            console.error('Error creating debt:', error);
            return ApiResponse.error("Error creating debt");
        } finally {
            if (conn) conn.release();
        }
    }

    static async Delete(id: string) {
        let conn;

        try {
            const query = `
            DELETE FROM debts WHERE id = ?
            `;

            conn = await pool.getConnection();
            const result = await conn.query(query, [id]);
            Logger.log("Debt deletion result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to delete debt");

            return ApiResponse.success(null, "Debt deleted successfully");
        } catch (error) {
            console.error('Error deleting debt:', error);
            return ApiResponse.error("Error deleting debt");
        } finally {
            if (conn) conn.release();
        }
    }

    static async Update(debt: any) {
        let conn;

        try {
            const { id, customer_id, amount, invoice_no, vat, description, issue_date } = debt;

            if (!id || !customer_id || !amount || !vat || !issue_date) {
                return ApiResponse.error("Missing required fields");
            }

            const query = `
            UPDATE debts
            SET customer_id = ?, amount = ?, invoice_no = ?, vat = ?, description = ?, issue_date = ?
            WHERE id = ?
            `;

            conn = await pool.getConnection();
            const result = await conn.query(query, [
                customer_id,
                amount,
                invoice_no || null,
                vat,
                description || null,
                issue_date,
                id
            ]);
            Logger.log("Debt update result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to update debt");

            return ApiResponse.success(null, "Debt updated successfully");
        } catch (error) {
            console.error('Error updating debt:', error);
            return ApiResponse.error("Error updating debt");
        } finally {
            if (conn) conn.release();
        }
    }
}