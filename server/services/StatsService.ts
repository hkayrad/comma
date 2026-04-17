import { Logger } from "../lib/utils/logger";
import { ApiResponse } from "../lib/utils/apiResponse";
import { DebtRepository } from "../repositories/DebtRepository";

export interface MonthlyStatsData {
    month: string;
    receivable: number;
    payable: number;
}

const recRepo = new DebtRepository("receivable");
const payRepo = new DebtRepository("payable");

class StatsService {
    /**
     * Gets aggregated monthly stats for receivables and payables.
     * @param companyId - The company ID to filter by
     * @param startDate - Optional start date. If not provided, defaults to (Now - monthCount)
     * @param monthCount - Number of months to retrieve (default 12)
     * @returns Array of monthly data with receivable and payable totals
     */
    async GetMonthlyStats(companyId: string, startDate?: Date, monthCount: number = 12) {
        try {
            let start: Date;
            let end: Date;

            if (startDate) {
                start = startDate;
                end = new Date(startDate);
                end.setMonth(end.getMonth() + monthCount);
            } else {
                end = new Date();
                start = new Date();
                start.setMonth(start.getMonth() - monthCount);
            }

            // Get receivable totals grouped by month
            const receivables = await recRepo.getMonthlyStats(companyId, start, end);

            // Get payable totals grouped by month
            const payables = await payRepo.getMonthlyStats(companyId, start, end);

            // Create a map of all months in range
            const monthsMap = new Map<string, MonthlyStatsData>();

            // Initialize with all months in the range
            for (let i = 0; i < monthCount; i++) {
                const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                monthsMap.set(monthKey, { month: monthKey, receivable: 0, payable: 0 });
            }

            // Populate receivables
            for (const row of receivables) {
                const existing = monthsMap.get(row.month);
                if (existing) {
                    existing.receivable = parseFloat(row.total) || 0;
                }
            }

            // Populate payables
            for (const row of payables) {
                const existing = monthsMap.get(row.month);
                if (existing) {
                    existing.payable = parseFloat(row.total) || 0;
                }
            }

            // Convert map to sorted array
            const data = Array.from(monthsMap.values()).sort((a, b) => a.month.localeCompare(b.month));

            Logger.debug("[StatsService] Monthly stats fetched", { companyId, dataPoints: data.length });
            return ApiResponse.success(data, "Monthly stats retrieved successfully");
        } catch (err: unknown) {
        	const error = err instanceof Error ? err : new Error(String(err));
            Logger.error("[StatsService] Error fetching monthly stats", { companyId, error: error.message });
            return ApiResponse.error("Error fetching monthly stats");
        }
    }
}

export default new StatsService();
