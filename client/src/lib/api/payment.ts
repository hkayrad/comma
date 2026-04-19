import instance from "../instance";
import type { ApiResponse, PaymentDto, UUID, UpcomingDueDate } from "../../../../common/types";
import { Logger } from "../utils/logger";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";

export class ReceivablePaymentApi {
	static async Create(data: PaymentDto): Promise<UUID | null> {
		try {
			const { data: response } = await instance.post<ApiResponse<UUID>>("/receivables/payments", data);

			if (response.success) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error creating payment:", response.message);
			return Promise.reject(response.message || "Ödeme eklenirken hata oluştu");
		} catch (error) {
			Logger.error("Error creating payment:", error);
			return Promise.reject("Ödeme eklenirken hata oluştu");
		}
	}

	static async GetAll(
		page: number = 0,
		pageSize: number = 20,
		sorting?: SortingState,
		filters?: ColumnFiltersState,
	): Promise<{ rows: PaymentDto[]; count: number } | null> {
		try {
			const params = new URLSearchParams();
			params.append("page", page.toString());
			params.append("limit", pageSize.toString());
			if (sorting) params.append("sorting", JSON.stringify(sorting));
			if (filters) params.append("filters", JSON.stringify(filters));

			const { data: response } = await instance.get<ApiResponse<{ rows: PaymentDto[]; count: number }>>(
				`/receivables/payments?${params.toString()}`,
			);

			if (response.success) {
				return Promise.resolve(response.data || { rows: [], count: 0 });
			}

			Logger.error("Error fetching payments:", response.message);
			return Promise.reject(response.message || "Ödemeler getirilirken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching payments:", error);
			return Promise.reject("Ödemeler getirilirken hata oluştu");
		}
	}

	static async Update(id: string, data: PaymentDto): Promise<string | null> {
		try {
			const { data: response } = await instance.put<ApiResponse<UUID>>(`/receivables/payments/${id}`, data);

			if (response.success) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error updating payment:", response.message);
			return Promise.reject(response.message || "Ödeme güncellenirken hata oluştu");
		} catch (error) {
			Logger.error("Error updating payment:", error);
			return Promise.reject("Ödeme güncellenirken hata oluştu");
		}
	}

	static async Delete(id: UUID): Promise<boolean> {
		try {
			const { data: response } = await instance.delete<ApiResponse<null>>(`/receivables/payments/${id}`);

			if (response.success) {
				return Promise.resolve(true);
			}

			Logger.error("Error deleting payment:", response.message);
			return Promise.reject(response.message || "Ödeme silinirken hata oluştu");
		} catch (error) {
			Logger.error("Error deleting payment:", error);
			return Promise.reject("Ödeme silinirken hata oluştu");
		}
	}

	static async GetUpcomingChecks(daysThreshold: number = 7): Promise<UpcomingDueDate[]> {
		try {
			const { data: response } = await instance.get<ApiResponse<UpcomingDueDate[]>>(
				`/receivables/payments/upcoming-checks?days=${daysThreshold}`,
			);

			if (response.success) {
				return Promise.resolve(response.data || []);
			}

			Logger.error("Error fetching upcoming checks:", response.message);
			return Promise.resolve([]);
		} catch (error) {
			Logger.error("Error fetching upcoming checks:", error);
			return Promise.resolve([]);
		}
	}
}

export class PayablePaymentApi {
	static async Create(data: PaymentDto): Promise<UUID | null> {
		try {
			const { data: response } = await instance.post<ApiResponse<UUID>>("/payables/payments", data);

			if (response.success) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error creating payment:", response.message);
			return Promise.reject(response.message || "Ödeme eklenirken hata oluştu");
		} catch (error) {
			Logger.error("Error creating payment:", error);
			return Promise.reject("Ödeme eklenirken hata oluştu");
		}
	}

	static async GetAll(
		page: number = 0,
		pageSize: number = 20,
		sorting?: SortingState,
		filters?: ColumnFiltersState,
	): Promise<{ rows: PaymentDto[]; count: number } | null> {
		try {
			const params = new URLSearchParams();
			params.append("page", page.toString());
			params.append("limit", pageSize.toString());
			if (sorting) params.append("sorting", JSON.stringify(sorting));
			if (filters) params.append("filters", JSON.stringify(filters));

			const { data: response } = await instance.get<ApiResponse<{ rows: PaymentDto[]; count: number }>>(
				`/payables/payments?${params.toString()}`,
			);

			if (response.success) {
				return Promise.resolve(response.data || { rows: [], count: 0 });
			}

			Logger.error("Error fetching payments:", response.message);
			return Promise.reject(response.message || "Ödemeler getirilirken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching payments:", error);
			return Promise.reject("Ödemeler getirilirken hata oluştu");
		}
	}

	static async Update(id: string, data: PaymentDto): Promise<string | null> {
		try {
			const { data: response } = await instance.put<ApiResponse<UUID>>(`/payables/payments/${id}`, data);

			if (response.success) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error updating payment:", response.message);
			return Promise.reject(response.message || "Ödeme güncellenirken hata oluştu");
		} catch (error) {
			Logger.error("Error updating payment:", error);
			return Promise.reject("Ödeme güncellenirken hata oluştu");
		}
	}

	static async Delete(id: UUID): Promise<boolean> {
		try {
			const { data: response } = await instance.delete<ApiResponse<null>>(`/payables/payments/${id}`);

			if (response.success) {
				return Promise.resolve(true);
			}

			Logger.error("Error deleting payment:", response.message);
			return Promise.reject(response.message || "Ödeme silinirken hata oluştu");
		} catch (error) {
			Logger.error("Error deleting payment:", error);
			return Promise.reject("Ödeme silinirken hata oluştu");
		}
	}

	static async GetUpcomingChecks(daysThreshold: number = 7): Promise<UpcomingDueDate[]> {
		try {
			const { data: response } = await instance.get<ApiResponse<UpcomingDueDate[]>>(
				`/payables/payments/upcoming-checks?days=${daysThreshold}`,
			);

			if (response.success) {
				return Promise.resolve(response.data || []);
			}

			Logger.error("Error fetching upcoming checks:", response.message);
			return Promise.resolve([]);
		} catch (error) {
			Logger.error("Error fetching upcoming checks:", error);
			return Promise.resolve([]);
		}
	}
}
