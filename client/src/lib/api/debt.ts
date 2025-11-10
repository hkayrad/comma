import instance from "../instance";
import type { ApiResponse, AvailableCurrency, DebtDto, Totals, UUID } from "../types";
import { Logger } from "../utils/logger";

export class ReceivableDebtApi {
    static async Create(data: DebtDto): Promise<UUID | null> {
        try {
            const { data: response } = await instance.post<ApiResponse<UUID>>("/receivable/debts", data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error creating debt:', response.message);
            return Promise.reject(response.message || "Borç eklenirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Borç eklenirken hata oluştu");
        }
    }

    static async GetAll(): Promise<DebtDto[] | null> {
        try {
            const { data: response } = await instance.get<ApiResponse<DebtDto[]>>("/receivable/debts");

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error fetching debts:', response.message);
            return Promise.reject(response.message || "Borçlar alınırken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Borçlar alınırken hata oluştu");
        }
    }

    static async GetTotals(currency: AvailableCurrency): Promise<Totals | null> {
        try {
            const { data: response } = await instance.get<ApiResponse<Totals>>("/receivable/debts/totals", {
                params: { currency }
            });

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error fetching debt totals:', response.message);
            return Promise.reject(response.message || "Borç toplamları alınırken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Borç toplamları alınırken hata oluştu");
        }
    }

    static async Update(id: string, data: DebtDto): Promise<string | null> {
        try {
            const { data: response } = await instance.put<ApiResponse<null>>(`/receivable/debts/${id}`, data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error updating debt:', response.message);
            return Promise.reject(response.message || "Borç güncellenirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Borç güncellenirken hata oluştu");
        }
    }

    static async Delete(id: string): Promise<boolean> {
        try {
            const { data: response } = await instance.delete<ApiResponse<null>>(`/receivable/debts/${id}`);

            if (response.status === 200) {
                return Promise.resolve(true);
            }

            Logger.error('Error deleting debt:', response.message);
            return Promise.reject(response.message || "Borç silinirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Borç silinirken hata oluştu");
        }
    }
}

export class PayableDebtApi {
    static async Create(data: DebtDto): Promise<UUID | null> {
        try {
            const { data: response } = await instance.post<ApiResponse<UUID>>("/payable/debts", data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error creating debt:', response.message);
            return Promise.reject(response.message || "Borç eklenirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Borç eklenirken hata oluştu");
        }
    }

    static async GetAll(): Promise<DebtDto[] | null> {
        try {
            const { data: response } = await instance.get<ApiResponse<DebtDto[]>>("/payable/debts");

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error fetching debts:', response.message);
            return Promise.reject(response.message || "Borçlar alınırken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Borçlar alınırken hata oluştu");
        }
    }

    static async GetTotals(currency: AvailableCurrency): Promise<Totals | null> {
        try {
            const { data: response } = await instance.get<ApiResponse<Totals>>("/payable/debts/totals", {
                params: { currency }
            });

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error fetching debt totals:', response.message);
            return Promise.reject(response.message || "Borç toplamları alınırken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Borç toplamları alınırken hata oluştu");
        }
    }

    static async Update(id: string, data: DebtDto): Promise<string | null> {
        try {
            const { data: response } = await instance.put<ApiResponse<null>>(`/payable/debts/${id}`, data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error updating debt:', response.message);
            return Promise.reject(response.message || "Borç güncellenirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Borç güncellenirken hata oluştu");
        }
    }

    static async Delete(id: string): Promise<boolean> {
        try {
            const { data: response } = await instance.delete<ApiResponse<null>>(`/payable/debts/${id}`);

            if (response.status === 200) {
                return Promise.resolve(true);
            }

            Logger.error('Error deleting debt:', response.message);
            return Promise.reject(response.message || "Borç silinirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Borç silinirken hata oluştu");
        }
    }
}