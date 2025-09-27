import { pool } from "../utils/db/pool";
import { ApiResponse, Logger } from "../utils";

export class PaymentsService {
    static async Create(payment: any) {
        let conn;

        try {
            const { customer_id, amount, invoice_no, payment_date, payment_note, payment_method } = payment;

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
            Logger.info("Payment creation result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to create payment");

            return ApiResponse.success(result[0], "Payment created successfully");
        } catch (error) {
            console.error('Error creating payment:', error);
            return ApiResponse.error("Error creating payment");
        } finally {
            if (conn) conn.release();
        }
    }

    static async GetAll() {
        let conn;

        try {
            const query = `
            SELECT 
                p.*,
                c.name AS customer_name, 
                c.tax_number AS customer_tax_number
            FROM payments p
            JOIN customers c ON p.customer_id = c.id
            ORDER BY p.payment_date DESC
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query);
            Logger.info("Retrieved payments:", result);

            return ApiResponse.success(result, "Payments retrieved successfully");
        } catch (error) {
            Logger.error("Failed to retrieve payments:", error);
            return ApiResponse.error("Failed to retrieve payments");
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }

    static async Update(paymentId: string, payment: any) {
        let conn;

        try {
            if (!paymentId) {
                Logger.log("Missing payment ID");
                return ApiResponse.error("Missing payment ID");
            }

            const { customer_id, amount, invoice_no, payment_date, payment_note, payment_method } = payment;

            if (!customer_id || !amount || !payment_date || !payment_method) {
                Logger.log("Missing required fields:", { customer_id, amount, payment_date, payment_method });
                return ApiResponse.error("Missing required fields");
            }

            Logger.log("Updating payment with ID:", paymentId);
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
                paymentId
            ]);
            Logger.info("Payment update result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("No payment found with the provided ID");

            return ApiResponse.success(result[0], "Payment updated successfully");
        } catch (error) {
            Logger.error("Failed to update payment:", error);
            return ApiResponse.error("Failed to update payment");
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }

    static async Delete(paymentId: string) {
        let conn;

        try {
            if (!paymentId) {
                Logger.log("Missing payment ID");
                return ApiResponse.error("Missing payment ID");
            }

            Logger.log("Deleting payment with ID:", paymentId);
            const query = `DELETE FROM payments WHERE id = ?`;

            conn = await pool.getConnection();

            const result = await conn.query(query, [paymentId]);
            Logger.info("Payment deletion result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("No payment found with the given ID");

            return ApiResponse.success(null, "Payment deleted successfully");
        } catch (error) {
            Logger.error("Failed to delete payment:", error);
            return ApiResponse.error("Failed to delete payment");
        } finally {
            if (conn) conn.release();
        }
    }
}