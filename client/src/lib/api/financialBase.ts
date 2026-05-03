import instance from "../instance";
import type { ApiResponse, UUID } from "@comma/common";
import { Logger } from "../utils/logger";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";

/**
 * Base class for financial entity APIs (Customers, Debts, Payments)
 * Handles common CRUD operations for both Receivable and Payable domains.
 */
export class FinancialBaseApi<T, CreateDto = T, UpdateDto = CreateDto> {
  constructor(public readonly domain: "receivables" | "payables", public readonly entity: string) { }

  get baseUrl() {
    return `/${this.domain}/${this.entity}s`;
  }

  async CreateBatch(data: CreateDto[]): Promise<void> {
    await instance.post(`${this.baseUrl}/batch`, data);
  }

  async Create(data: CreateDto): Promise<UUID | null> {
    try {
      const { data: response } = await instance.post<ApiResponse<UUID>>(this.baseUrl, data);
      if (response.success) return response.data;
      return Promise.reject(response.message || `Error creating ${this.entity}`);
    } catch (error) {
      Logger.error(`Error creating ${this.entity}:`, error);
      return Promise.reject(`Error creating ${this.entity}`);
    }
  }

  async GetAll(
    page: number = 0,
    pageSize: number = 20,
    sorting?: SortingState,
    filters?: ColumnFiltersState,
  ): Promise<{ rows: T[]; count: number } | null> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", pageSize.toString());
      if (sorting) params.append("sorting", JSON.stringify(sorting));
      if (filters) params.append("filters", JSON.stringify(filters));

      const { data: response } = await instance.get<ApiResponse<{ rows: T[]; count: number }>>(
        `${this.baseUrl}?${params.toString()}`,
      );

      if (response.success) return response.data || { rows: [], count: 0 };
      return Promise.reject(response.message || `Error fetching ${this.entity}s`);
    } catch (error) {
      Logger.error(`Error fetching ${this.entity}s:`, error);
      return Promise.reject(`Error fetching ${this.entity}s`);
    }
  }

  async Update(id: string, data: UpdateDto): Promise<any> {
    try {
      const { data: response } = await instance.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, data);
      if (response.success) return response.data;
      return Promise.reject(response.message || `Error updating ${this.entity}`);
    } catch (error) {
      Logger.error(`Error updating ${this.entity}:`, error);
      return Promise.reject(`Error updating ${this.entity}`);
    }
  }

  async Delete(id: string): Promise<any> {
    try {
      const { data: response } = await instance.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
      if (response.success) return response.data ?? true;
      return Promise.reject(response.message || `Error deleting ${this.entity}`);
    } catch (error) {
      Logger.error(`Error deleting ${this.entity}:`, error);
      return Promise.reject(`Error deleting ${this.entity}`);
    }
  }

  async Restore(id: string): Promise<any> {
    try {
      const { data: response } = await instance.post<ApiResponse<any>>(`${this.baseUrl}/${id}/restore`);
      if (response.success) return response.data ?? true;
      return Promise.reject(response.message || `Error restoring ${this.entity}`);
    } catch (error) {
      Logger.error(`Error restoring ${this.entity}:`, error);
      return Promise.reject(`Error restoring ${this.entity}`);
    }
  }
}
