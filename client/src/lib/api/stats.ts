import instance from "../instance";
import type { ApiResponse } from "@comma/common";
import { Logger } from "../utils/logger";

export interface MonthlyStatsData {
    month: string;
    receivable: number;
    payable: number;
}

export class StatsApi {
    static async GetMonthlyStats(startDate?: string, months: number = 12): Promise<MonthlyStatsData[]> {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (months) params.append("months", months.toString());

            const { data: response } = await instance.get<ApiResponse<MonthlyStatsData[]>>(`/stats/monthly?${params.toString()}`);

            if (response.success) {
                return Promise.resolve(response.data || []);
            }

            Logger.error("Error fetching monthly stats:", response.message);
            return Promise.reject(response.message || "Aylık istatistikler getirilirken hata oluştu");
        } catch (error) {
            Logger.error("Error fetching monthly stats:", error);
            return Promise.reject("Aylık istatistikler getirilirken hata oluştu");
        }
    }
}
