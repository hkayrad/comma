import { pool } from "../utils/db/pool";
import { ApiResponse, Logger } from "../utils";

export class PaymentsService {
    static async GetAll() {
        let conn;

        try {
            const query = `
            SELECT p.*, c.name AS customer_name FROM payments p
            JOIN customers c ON p.customer_id = c.id ORDER BY p.payment_date DESC
            `;

            conn = await pool.getConnection();
            const rows = await conn.query(query);

            if (rows.length === 0)
                return ApiResponse.success([], "No payments found");

            return ApiResponse.success(rows, "Payments retrieved successfully");

        } catch (error) {
            console.error('Error fetching payments:', error);
            return ApiResponse.error("Error fetching payments");
        } finally {
            if (conn) conn.release();
        }
    }

    static async Create(payment: any) {
        let conn;

        try {
            const { customer_id, amount, invoice_no, payment_note, payment_date, payment_method } = payment;

            if (!customer_id || !amount || !payment_date || !payment_method) {
                Logger.log("Missing required fields:", { customer_id, amount, payment_date, payment_method });
                return ApiResponse.error("Missing required fields");
            }

            Logger.log("Creating payment with data:", payment);
            const query = `
            INSERT INTO payments (customer_id, amount, invoice_no, payment_note, payment_date, payment_method)
            VALUES (?, ?, ?, ?, ?, ?) RETURNING id
            `;

            conn = await pool.getConnection();
            
            const result = await conn.query(query, [
                customer_id,
                amount,
                invoice_no || null,
                payment_note || null,
                payment_date,
                payment_method
            ]);
            Logger.log("Payment creation result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to create payment");

            return ApiResponse.success({ id: result.insertId }, "Payment created successfully");
        } catch (error) {
            console.error('Error creating payment:', error);
            return ApiResponse.error("Error creating payment");
        } finally {
            if (conn) conn.release();
        }
    }

    static async Delete(id: string) {
        let conn;

        try {
            const query = `
            DELETE FROM payments WHERE id = ?
            `;

            conn = await pool.getConnection();
            const result = await conn.query(query, [id]);
            Logger.log("Payment deletion result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to delete payment");

            return ApiResponse.success(null, "Payment deleted successfully");
        } catch (error) {
            console.error('Error deleting payment:', error);
            return ApiResponse.error("Error deleting payment");
        } finally {
            if (conn) conn.release();
        }
    }

    static async Update(debt: any) {
        let conn;

        try {
            const { id, customer_id, amount, invoice_no, payment_note, payment_date, payment_method } = debt;

            if (!id || !customer_id || !amount || !payment_date || !payment_method) {
                Logger.log("Missing required fields:", { id, customer_id, amount, payment_date, payment_method });
                return ApiResponse.error("Missing required fields");
            }

            const query = `
            UPDATE payments
            SET customer_id = ?, amount = ?, invoice_no = ?, payment_note = ?, payment_date = ?, payment_method = ?
            WHERE id = ?
            `;

            conn = await pool.getConnection();
            const result = await conn.query(query, [
                customer_id,
                amount,
                invoice_no || null,
                payment_note || null,
                payment_date,
                payment_method,
                id
            ]);
            Logger.log("Payment update result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to update payment");

            return ApiResponse.success(null, "Payment updated successfully");
        } catch (error) {
            console.error('Error updating payment:', error);
            return ApiResponse.error("Error updating payment");
        } finally {
            if (conn) conn.release();
        }
    }
}