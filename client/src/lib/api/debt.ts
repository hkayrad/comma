import instance from "../instance";
import type { ApiResponse, DebtDto, Totals, UpcomingDueDate } from "@comma/common";
import { Logger } from "../utils/logger";
import { FinancialBaseApi } from "./financialBase";

class BaseDebtApi extends FinancialBaseApi<DebtDto> {
  constructor(domain: "receivables" | "payables") {
    super(domain, "debt");
  }

  async GetTotals(currency: string): Promise<Totals | null> {
    try {
      const { data: response } = await instance.get<ApiResponse<Totals>>(`${this.baseUrl}/totals`, {
        params: { currency },
      });
      if (response.success) return response.data;
      return Promise.reject(response.message || "Borç toplamları alınırken hata oluştu");
    } catch (error) {
      Logger.error("Error fetching debt totals:", error);
      return Promise.reject("Borç toplamları alınırken hata oluştu");
    }
  }

  async GetUpcomingDueDates(daysThreshold: number = 7): Promise<UpcomingDueDate[]> {
    try {
      const { data: response } = await instance.get<ApiResponse<UpcomingDueDate[]>>(
        `${this.baseUrl}/upcoming-due-dates?days=${daysThreshold}`,
      );
      if (response.success) return response.data || [];
      return [];
    } catch (error) {
      Logger.error("Error fetching upcoming due dates:", error);
      return [];
    }
  }
}

export const ReceivableDebtApi = new BaseDebtApi("receivables");
export const PayableDebtApi = new BaseDebtApi("payables");
