import { pool } from "../utils/db/pool";
import { ApiResponse } from "../utils";

export class DebtsService {
    static async GetAll(req: any, res: any) {
        let conn;

        try {
            const query = `
            SELECT d.*, c.name AS customer_name FROM debts d
            JOIN customers c ON d.customer_id = c.id
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
}