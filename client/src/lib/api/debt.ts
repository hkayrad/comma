import instance from "../instance";
import type { ApiResponse, DebtDto, Totals, UUID } from "../../../../common/types";
import { Logger } from "../utils/logger";

export class ReceivableDebtApi {
	static async Create(data: DebtDto): Promise<UUID | null> {
		try {
			const { data: response } = await instance.post<ApiResponse<UUID>>("/receivables/debts", data);

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error creating debt:", response.message);
			return Promise.reject(response.message || "Borç eklenirken hata oluştu");
		} catch (error) {
			Logger.error("Error creating debt:", error);
			return Promise.reject("Borç eklenirken hata oluştu");
		}
	}

	static async GetAll(page: number = 0, pageSize: number = 20): Promise<{ rows: DebtDto[]; count: number } | null> {
		try {
			const { data: response } = await instance.get<ApiResponse<{ rows: DebtDto[]; count: number }>>(`/receivables/debts?page=${page}&limit=${pageSize}`);

			if (response.status === 200) {
				return Promise.resolve(response.data || { rows: [], count: 0 });
			}

			Logger.error("Error fetching debts:", response.message);
			return Promise.reject(response.message || "Borçlar alınırken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching debts:", error);
			return Promise.reject("Borçlar alınırken hata oluştu");
		}
	}

	static async GetTotals(currency: string): Promise<Totals | null> {
		try {
			const { data: response } = await instance.get<ApiResponse<Totals>>("/receivables/debts/totals", {
				params: { currency },
			});

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error fetching debt totals:", response.message);
			return Promise.reject(response.message || "Borç toplamları alınırken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching debt totals:", error);
			return Promise.reject("Borç toplamları alınırken hata oluştu");
		}
	}

	static async Update(id: string, data: DebtDto): Promise<string | null> {
		try {
			Logger.info(data)
			const { data: response } = await instance.put<ApiResponse<null>>(`/receivables/debts/${id}`, data);

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error updating debt:", response.message);
			return Promise.reject(response.message || "Borç güncellenirken hata oluştu");
		} catch (error) {
			Logger.error("Error updating debt:", error);
			return Promise.reject("Borç güncellenirken hata oluştu");
		}
	}

	static async Delete(id: string): Promise<boolean> {
		try {
			const { data: response } = await instance.delete<ApiResponse<null>>(`/receivables/debts/${id}`);

			if (response.status === 200) {
				return Promise.resolve(true);
			}

			Logger.error("Error deleting debt:", response.message);
			return Promise.reject(response.message || "Borç silinirken hata oluştu");
		} catch (error) {
			Logger.error("Error deleting debt:", error);
			return Promise.reject("Borç silinirken hata oluştu");
		}
	}
}

export class PayableDebtApi {
	static async Create(data: DebtDto): Promise<UUID | null> {
		try {
			const { data: response } = await instance.post<ApiResponse<UUID>>("/payables/debts", data);

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error creating debt:", response.message);
			return Promise.reject(response.message || "Borç eklenirken hata oluştu");
		} catch (error) {
			Logger.error("Error creating debt:", error);
			return Promise.reject("Borç eklenirken hata oluştu");
		}
	}

	static async GetAll(page: number = 0, pageSize: number = 20): Promise<{ rows: DebtDto[]; count: number } | null> {
		try {
			const { data: response } = await instance.get<ApiResponse<{ rows: DebtDto[]; count: number }>>(`/payables/debts?page=${page}&limit=${pageSize}`);

			if (response.status === 200) {
				return Promise.resolve(response.data || { rows: [], count: 0 });
			}

			Logger.error("Error fetching debts:", response.message);
			return Promise.reject(response.message || "Borçlar alınırken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching debts:", error);
			return Promise.reject("Borçlar alınırken hata oluştu");
		}
	}

	static async GetTotals(currency: string): Promise<Totals | null> {
		try {
			const { data: response } = await instance.get<ApiResponse<Totals>>("/payables/debts/totals", {
				params: { currency },
			});

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error fetching debt totals:", response.message);
			return Promise.reject(response.message || "Borç toplamları alınırken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching debt totals:", error);
			return Promise.reject("Borç toplamları alınırken hata oluştu");
		}
	}

	static async Update(id: string, data: DebtDto): Promise<string | null> {
		try {
			const { data: response } = await instance.put<ApiResponse<null>>(`/payables/debts/${id}`, data);

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error updating debt:", response.message);
			return Promise.reject(response.message || "Borç güncellenirken hata oluştu");
		} catch (error) {
			Logger.error("Error updating debt:", error);
			return Promise.reject("Borç güncellenirken hata oluştu");
		}
	}

	static async Delete(id: string): Promise<boolean> {
		try {
			const { data: response } = await instance.delete<ApiResponse<null>>(`/payables/debts/${id}`);

			if (response.status === 200) {
				return Promise.resolve(true);
			}

			Logger.error("Error deleting debt:", response.message);
			return Promise.reject(response.message || "Borç silinirken hata oluştu");
		} catch (error) {
			Logger.error("Error deleting debt:", error);
			return Promise.reject("Borç silinirken hata oluştu");
		}
	}
}
