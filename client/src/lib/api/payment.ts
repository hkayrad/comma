import instance from "../instance";
import type { ApiResponse, PaymentDto, UpcomingDueDate } from "@comma/common";
import { Logger } from "../utils/logger";
import { FinancialBaseApi } from "./financialBase";

class BasePaymentApi extends FinancialBaseApi<PaymentDto> {
  constructor(domain: "receivables" | "payables") {
    super(domain, "payment");
  }

  async GetUpcomingChecks(daysThreshold: number = 7): Promise<UpcomingDueDate[]> {
    try {
      const { data: response } = await instance.get<ApiResponse<UpcomingDueDate[]>>(
        `${this.baseUrl}/upcoming-checks?days=${daysThreshold}`,
      );
      if (response.success) return response.data || [];
      return [];
    } catch (error) {
      Logger.error("Error fetching upcoming checks:", error);
      return [];
    }
  }
}

export const ReceivablePaymentApi = new BasePaymentApi("receivables");
export const PayablePaymentApi = new BasePaymentApi("payables");
