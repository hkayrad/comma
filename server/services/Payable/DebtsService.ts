import { pool } from "../../utils/db/pool";
import { ApiResponse, Logger } from "../../utils";

export default class PayableDebtsService {
    static async Create(debt: any, companyId: string) {
        let conn;

        try {
            const { customer_id, amount, vat, currency, issue_date, invoice_no, description } = debt;

            if (!customer_id || amount === undefined || amount === null || !issue_date || vat === undefined || vat === null || !currency) {
                return ApiResponse.error("Customer, amount, issue date, VAT, and currency are required");
            }

            const query = `
            INSERT INTO payable_debts (customer_id, amount, vat, currency, issue_date, invoice_no, description, company_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [customer_id, amount, vat, currency, issue_date, invoice_no, description, companyId]);
            Logger.info("Debt creation result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("Failed to create debt");

            return ApiResponse.success(result[0].id, "Debt created successfully");
        } catch (error) {
            Logger.error("Failed to create debt:", error);
            return ApiResponse.error("Failed to create debt");
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }

    static async GetAll(companyId: string) {
        let conn;

        try {
            const query = `
            SELECT 
                d.*,
                (d.amount + d.vat) AS total_amount,
                c.name AS customer_name, 
                c.tax_number AS customer_tax_number
            FROM payable_debts d
            JOIN payable_customers c ON d.customer_id = c.id
            WHERE d.company_id = ?
            ORDER BY d.issue_date DESC
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [companyId]);
            Logger.info("Retrieved payable_debts:", result);

            return ApiResponse.success(result, "Debts retrieved successfully");
        } catch (error) {
            Logger.error("Failed to retrieve payable_debts:", error);
            return ApiResponse.error("Failed to retrieve payable_debts");
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }

    static async GetTotals(companyId: string, currency: string) {
        let conn;

        try {
            const query = `
            SELECT
                COALESCE((SELECT SUM(amount + vat) FROM payable_debts WHERE company_id = ? AND currency = ?), 0) AS total_debts,
                COALESCE((SELECT SUM(amount) FROM payable_payments WHERE company_id = ? AND currency = ?), 0) AS total_payments,
                COALESCE((COALESCE((SELECT SUM(amount + vat) FROM payable_debts WHERE company_id = ? AND currency = ?), 0) - COALESCE((SELECT SUM(amount) FROM payable_payments WHERE company_id = ? AND currency = ?), 0)), 0) AS remaining_debt
            `;

            console.log(currency);
            

            conn = await pool.getConnection();

            const result = await conn.query(query, [companyId, currency, companyId, currency, companyId, currency, companyId, currency]);
            Logger.info("Retrieved total debt:", result);

            if (result.length === 0)
                return ApiResponse.error("No debt data found");

            return ApiResponse.success(result[0], "Total debt retrieved successfully");
        } catch (error) {
            Logger.error("Failed to retrieve total debt:", error);
            return ApiResponse.error("Failed to retrieve total debt");
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }

    static async Update(id: string, debt: any, companyId: string) {
        let conn;

        try {
            if (!id) {
                return ApiResponse.error("Debt ID is required");
            }

            const { customer_id, amount, vat, currency, issue_date, invoice_no, description } = debt;

            if (!customer_id || amount === undefined || amount === null || !issue_date || vat === undefined || vat === null || !currency) {
                return ApiResponse.error("Customer, amount, issue date, VAT, and currency are required");
            }

            const query = `
            UPDATE payable_debts 
            SET customer_id = ?, amount = ?, vat = ?, currency = ?, issue_date = ?, invoice_no = ?, description = ?
            WHERE id = ? AND company_id = ?
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [customer_id, amount, vat, currency, issue_date, invoice_no, description, id, companyId]);
            Logger.info("Debt update result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("No debt found with the provided ID");

            return ApiResponse.success(result[0], "Debt updated successfully");
        } catch (error) {
            Logger.error("Failed to update debt:", error);
            return ApiResponse.error("Failed to update debt");
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }

    static async Delete(id: string, companyId: string) {
        let conn;

        try {
            if (!id) {
                return ApiResponse.error("Debt ID is required");
            }

            const query = `
            DELETE FROM payable_debts WHERE id = ? AND company_id = ?
            `;

            conn = await pool.getConnection();

            const result = await conn.query(query, [id, companyId]);
            Logger.info("Debt deletion result:", result);

            if (result.affectedRows === 0)
                return ApiResponse.error("No debt found with the provided ID");

            return ApiResponse.success(null, "Debt deleted successfully");
        } catch (error) {
            Logger.error("Failed to delete debt:", error);
            return ApiResponse.error("Failed to delete debt");
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }
}