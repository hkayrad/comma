import { Logger } from "@/lib/utils/logger";
import { DebtRepository } from "@/repositories/DebtRepository";

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
        let start: Date;
        let end: Date;

        if (startDate) {
            start = startDate;
            end = new Date(startDate);
            end.setMonth(end.getMonth() + monthCount);
        } else {
            end = new Date();
            start = new Date();
            start.setMonth(start.getMonth() - monthCount + 1);
        }

        const [receivables, payables] = await Promise.all([
            recRepo.getMonthlyStats(companyId, start, end),
            payRepo.getMonthlyStats(companyId, start, end),
        ]);

        const monthsMap = new Map<string, MonthlyStatsData>();

        for (let i = 0; i < monthCount; i++) {
            const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            monthsMap.set(monthKey, { month: monthKey, receivable: 0, payable: 0 });
        }

        for (const row of receivables) {
            const existing = monthsMap.get(row.month);
            if (existing) existing.receivable = parseFloat(row.total) || 0;
        }

        for (const row of payables) {
            const existing = monthsMap.get(row.month);
            if (existing) existing.payable = parseFloat(row.total) || 0;
        }

        const data = Array.from(monthsMap.values()).sort((a, b) => a.month.localeCompare(b.month));

        Logger.debug("[StatsService] Monthly stats fetched", { companyId, dataPoints: data.length });
        return data;
    }
}

export default new StatsService();
