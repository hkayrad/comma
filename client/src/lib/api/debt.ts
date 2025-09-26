import instance from "../instance";
import type { ApiResponse, DebtDto, Totals, UUID } from "../types";
import { Logger } from "../utils/logger";

export class DebtApi {
    static async Create(data: DebtDto): Promise<UUID | null> {
        try {
            const { data: response } = await instance.post<ApiResponse<UUID>>("/debts", data);

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
            const { data: response } = await instance.get<ApiResponse<DebtDto[]>>("/debts");

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

    static async GetTotals(): Promise<Totals | null> {
        try {
            const { data: response } = await instance.get<ApiResponse<Totals>>("/debts/totals");

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

    static async Delete(id: string): Promise<boolean> {
        try {
            const { data: response } = await instance.delete<ApiResponse<null>>(`/debts/${id}`);

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