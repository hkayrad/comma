import instance from "../instance";
import type { ApiResponse, CustomerDto, CustomerIdName, CustomerStatement } from "@comma/common";
import { Logger } from "../utils/logger";
import { FinancialBaseApi } from "./financialBase";

class BaseCustomerApi extends FinancialBaseApi<CustomerDto> {
  constructor(domain: "receivables" | "payables") {
    super(domain, "customer");
  }

  async GetIdAndName(): Promise<CustomerIdName[]> {
    try {
      const { data: response } = await instance.get<ApiResponse<CustomerIdName[]>>(`${this.baseUrl}/id-name`);
      if (response.success) return response.data || [];
      return Promise.reject(response.message || "Müşteriler getirilirken hata oluştu");
    } catch (error) {
      Logger.error("Error fetching customer id-name:", error);
      return Promise.reject("Müşteriler getirilirken hata oluştu");
    }
  }

  async GetStatement(
    id: string,
    filters?: { startDate?: string; endDate?: string },
  ): Promise<CustomerStatement | null> {
    try {
      const { startDate, endDate } = filters || {};
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const { data: response } = await instance.get<ApiResponse<CustomerStatement>>(
        `${this.baseUrl}/${id}/statement?${queryParams.toString()}`,
      );

      if (response.success) return response.data;
      return Promise.reject(response.message || "Müşteri borç dökümü getirilirken hata oluştu");
    } catch (error) {
      Logger.error("Error fetching customer statement:", error);
      return Promise.reject("Müşteri borç dökümü getirilirken hata oluştu");
    }
  }
}

export const ReceivableCustomerApi = new BaseCustomerApi("receivables");
export const PayableCustomerApi = new BaseCustomerApi("payables");
