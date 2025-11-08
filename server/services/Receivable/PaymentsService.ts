import { pool } from "../../utils/db/pool";
import { ApiResponse, Logger } from "../../utils";

export default class ReceivablePaymentsService {
    static async Create(payment: any, companyId: string) {
        let conn;

        try {
            const { customer_id, amount, invoice_no, payment_date, description, payment_method } = payment;

            if (!customer_id || !amount || !payment_date || !payment_method) {
                Logger.log("Missing required fields:", { customer_id, amount, payment_date, payment_method });
                return ApiResponse.error("Missing required fields");
            }

            Logger.log("Creating payment with data:", payment);
            const query = `
            INSERT INTO receivable_payments (customer_id, amount, invoice_no, description, payment_date, payment_method, company_id)
            VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [
                customer_id,
                amount,
                invoice_no || null,
                description || null,
                payment_date,
                payment_method,
                companyId
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

    static async GetAll(companyId: string) {
        let conn;

        try {
            const query = `
            SELECT 
                p.*,
                c.name AS customer_name, 
                c.tax_number AS customer_tax_number
            FROM receivable_payments p
            JOIN receivable_customers c ON p.customer_id = c.id
            WHERE p.company_id = ?
            ORDER BY p.payment_date DESC
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [companyId]);
            Logger.info("Retrieved receivable_payments:", result);

            return ApiResponse.success(result, "Payments retrieved successfully");
        } catch (error) {
            Logger.error("Failed to retrieve receivable_payments:", error);
            return ApiResponse.error("Failed to retrieve receivable_payments");
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }

    static async Update(paymentId: string, payment: any, companyId: string) {
        let conn;

        try {
            if (!paymentId) {
                Logger.log("Missing payment ID");
                return ApiResponse.error("Missing payment ID");
            }

            const { customer_id, amount, invoice_no, payment_date, description, payment_method } = payment;

            if (!customer_id || !amount || !payment_date || !payment_method) {
                Logger.log("Missing required fields:", { customer_id, amount, payment_date, payment_method });
                return ApiResponse.error("Missing required fields");
            }

            Logger.log("Updating payment with ID:", paymentId);
            const query = `
            UPDATE receivable_payments
            SET customer_id = ?, amount = ?, invoice_no = ?, description = ?, payment_date = ?, payment_method = ?
            WHERE id = ? AND company_id = ?
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [
                customer_id,
                amount,
                invoice_no || null,
                description || null,
                payment_date,
                payment_method,
                paymentId,
                companyId
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

    static async Delete(paymentId: string, companyId: string) {
        let conn;

        try {
            if (!paymentId) {
                Logger.log("Missing payment ID");
                return ApiResponse.error("Missing payment ID");
            }

            Logger.log("Deleting payment with ID:", paymentId);
            const query = `DELETE FROM receivable_payments WHERE id = ? AND company_id = ?`;

            conn = await pool.getConnection();

            const result = await conn.query(query, [paymentId, companyId]);
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