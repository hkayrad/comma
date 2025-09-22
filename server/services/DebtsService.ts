import { pool } from "../utils/db/pool";
import { ApiResponse, Logger } from "../utils";

export class DebtsService {
    static async GetAll() {
        let conn;

        try {
            const query = `
            SELECT 
                d.*, 
                c.name AS customer_name ,
                COALESCE(SUM(p.amount), 0) as total_paid,
                CASE 
                    WHEN COALESCE(SUM(p.amount), 0) >= (d.amount + d.vat) THEN true 
                    ELSE false 
                END as is_fully_paid
            FROM debts d
            JOIN customers c ON d.customer_id = c.id
            LEFT JOIN payments p ON d.invoice_no = p.invoice_no AND d.customer_id = p.customer_id
            GROUP BY d.id, d.customer_id, d.amount, d.invoice_no, d.vat, d.description, d.issue_date, c.name
            ORDER BY d.issue_date DESC
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

    static async GetById(id: string) {
        let conn;

        try {
            const query = `
            SELECT 
                d.*, 
                c.name AS customer_name,
                COALESCE(SUM(p.amount), 0) as total_paid,
                CASE 
                    WHEN COALESCE(SUM(p.amount), 0) >= (d.amount + d.vat) THEN true 
                    ELSE false 
                END as is_fully_paid
            FROM debts d
            JOIN customers c ON d.customer_id = c.id
            LEFT JOIN payments p ON d.invoice_no = p.invoice_no AND d.customer_id = p.customer_id
            WHERE d.id = ?
            GROUP BY d.id, d.customer_id, d.amount, d.invoice_no, d.vat, d.description, d.issue_date, c.name
            `;

            conn = await pool.getConnection();
            const rows = await conn.query(query, [id]);

            if (rows.length === 0)
                return ApiResponse.error("Debt not found");

            return ApiResponse.success(rows[0], "Debt retrieved successfully");

        } catch (error) {
            console.error('Error fetching debt:', error);
            return ApiResponse.error("Error fetching debt");
        } finally {
            if (conn) conn.release();
        }
    }

    static async GetByInvoiceNo(invoiceNo: string) {
        let conn;

        try {
            const query = `
            SELECT 
                d.*, 
                c.name AS customer_name,
                COALESCE(SUM(p.amount), 0) as total_paid,
                CASE 
                    WHEN COALESCE(SUM(p.amount), 0) >= (d.amount + d.vat) THEN true 
                    ELSE false 
                END as is_fully_paid
            FROM debts d
            JOIN customers c ON d.customer_id = c.id
            LEFT JOIN payments p ON d.invoice_no = p.invoice_no AND d.customer_id = p.customer_id
            WHERE d.invoice_no = ?
            GROUP BY d.id, d.customer_id, d.amount, d.invoice_no, d.vat, d.description, d.issue_date, c.name
            `;

            conn = await pool.getConnection();
            const rows = await conn.query(query, [invoiceNo]);

            if (rows.length === 0)
                return ApiResponse.error("Debt not found");

            return ApiResponse.success(rows, "Debt retrieved successfully");

        } catch (error) {
            console.error('Error fetching debt by invoice:', error);
            return ApiResponse.error("Error fetching debt by invoice");
        } finally {
            if (conn) conn.release();
        }
    }

    static async GetUnpaidByCustomer(customerId: string) {
        let conn;

        try {
            const query = `
            SELECT 
                d.id,
                d.invoice_no,
                d.amount,
                d.vat,
                d.description,
                d.issue_date,
                c.name AS customer_name,
                COALESCE(SUM(p.amount), 0) as total_paid,
                (d.amount + d.vat) as debt_amount,
                (d.amount + d.vat - COALESCE(SUM(p.amount), 0)) as remaining_amount,
                CASE 
                    WHEN COALESCE(SUM(p.amount), 0) >= (d.amount + d.vat) THEN true 
                    ELSE false 
                END as is_fully_paid
            FROM debts d
            JOIN customers c ON d.customer_id = c.id
            LEFT JOIN payments p ON d.invoice_no = p.invoice_no AND d.customer_id = p.customer_id
            WHERE d.customer_id = ?
            GROUP BY d.id, d.customer_id, d.amount, d.invoice_no, d.vat, d.description, d.issue_date, c.name
            HAVING is_fully_paid = false
            ORDER BY d.issue_date ASC
            `;

            conn = await pool.getConnection();
            const rows = await conn.query(query, [customerId]);

            if (rows.length === 0)
                return ApiResponse.success(null, "No unpaid debts found for this customer");

            // Calculate totals
            const totalDebtAmount = rows.reduce((sum: number, debt: any) => sum + parseFloat(debt.debt_amount), 0);
            const totalPaidAmount = rows.reduce((sum: number, debt: any) => sum + parseFloat(debt.total_paid), 0);
            const totalRemainingAmount = rows.reduce((sum: number, debt: any) => sum + parseFloat(debt.remaining_amount), 0);

            const result = {
                customer_name: rows[0].customer_name,
                unpaid_debts: rows,
                summary: {
                    total_debt_amount: totalDebtAmount,
                    total_paid_amount: totalPaidAmount,
                    total_remaining_amount: totalRemainingAmount,
                    unpaid_invoice_count: rows.length
                }
            };

            return ApiResponse.success(result, "Unpaid debts retrieved successfully");

        } catch (error) {
            console.error('Error fetching unpaid debts:', error);
            return ApiResponse.error("Error fetching unpaid debts");
        } finally {
            if (conn) conn.release();
        }
    }

    static async GetAllUnpaidDebts() {
        let conn;

        try {
            const query = `
            SELECT 
                d.id,
                d.customer_id,
                d.invoice_no,
                d.amount as debt_amount,
                d.vat,
                d.description,
                d.issue_date,
                c.name AS customer_name,
                COALESCE(SUM(p.amount), 0) as total_paid,
                (d.amount - COALESCE(SUM(p.amount), 0)) as remaining_amount,
                CASE 
                    WHEN COALESCE(SUM(p.amount), 0) >= d.amount THEN true 
                    ELSE false 
                END as is_fully_paid
            FROM debts d
            JOIN customers c ON d.customer_id = c.id
            LEFT JOIN payments p ON d.invoice_no = p.invoice_no
            GROUP BY d.id, d.customer_id, d.amount, d.invoice_no, d.vat, d.description, d.issue_date, c.name
            HAVING is_fully_paid = false
            ORDER BY c.name ASC, d.issue_date ASC
            `;

            conn = await pool.getConnection();
            const rows = await conn.query(query);

            if (rows.length === 0)
                return ApiResponse.success([], "No unpaid debts found");

            // Group by customer
            const groupedByCustomer = rows.reduce((acc: any, debt: any) => {
                const customerId = debt.customer_id;
                if (!acc[customerId]) {
                    acc[customerId] = {
                        customer_id: customerId,
                        customer_name: debt.customer_name,
                        unpaid_debts: [],
                        total_debt_amount: 0,
                        total_paid_amount: 0,
                        total_remaining_amount: 0
                    };
                }

                acc[customerId].unpaid_debts.push(debt);
                acc[customerId].total_debt_amount += debt.debt_amount;
                acc[customerId].total_paid_amount += debt.total_paid;
                acc[customerId].total_remaining_amount += debt.remaining_amount;

                return acc;
            }, {});

            const result = Object.values(groupedByCustomer);

            return ApiResponse.success(result, "All unpaid debts retrieved successfully");

        } catch (error) {
            console.error('Error fetching all unpaid debts:', error);
            return ApiResponse.error("Error fetching all unpaid debts");
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