import instance from "../instance";
import type { ApiResponse, PaymentDto, UUID } from "../types";
import { Logger } from "../utils/logger";

export class ReceivablePaymentApi {
    static async Create(data: PaymentDto): Promise<UUID | null> {
        try {
            const { data: response } = await instance.post<ApiResponse<UUID>>("/receivable/payments", data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error creating payment:', response.message);
            return Promise.reject(response.message || "Ödeme eklenirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Ödeme eklenirken hata oluştu");
        }
    }

    static async GetAll(): Promise<PaymentDto[] | null> {
        try {
            const { data: response } = await instance.get<ApiResponse<PaymentDto[]>>("/receivable/payments");

            if (response.status === 200) {
                return Promise.resolve(response.data || []);
            }

            Logger.error('Error fetching payments:', response.message);
            return Promise.reject(response.message || "Ödemeler getirilirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Ödemeler getirilirken hata oluştu");
        }
    }

    static async Update(id: string, data: PaymentDto): Promise<string | null> {
        try {
            const { data: response } = await instance.put<ApiResponse<UUID>>(`/receivable/payments/${id}`, data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error updating payment:', response.message);
            return Promise.reject(response.message || "Ödeme güncellenirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Ödeme güncellenirken hata oluştu");
        }
    }

    static async Delete(id: UUID): Promise<boolean> {
        try {
            const { data: response } = await instance.delete<ApiResponse<null>>(`/receivable/payments/${id}`);

            if (response.status === 200) {
                return Promise.resolve(true);
            }

            Logger.error('Error deleting payment:', response.message);
            return Promise.reject(response.message || "Ödeme silinirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Ödeme silinirken hata oluştu");
        }
    }
}

export class PayablePaymentApi {
    static async Create(data: PaymentDto): Promise<UUID | null> {
        try {
            const { data: response } = await instance.post<ApiResponse<UUID>>("/payable/payments", data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error creating payment:', response.message);
            return Promise.reject(response.message || "Ödeme eklenirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Ödeme eklenirken hata oluştu");
        }
    }

    static async GetAll(): Promise<PaymentDto[] | null> {
        try {
            const { data: response } = await instance.get<ApiResponse<PaymentDto[]>>("/payable/payments");

            if (response.status === 200) {
                return Promise.resolve(response.data || []);
            }

            Logger.error('Error fetching payments:', response.message);
            return Promise.reject(response.message || "Ödemeler getirilirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Ödemeler getirilirken hata oluştu");
        }
    }

    static async Update(id: string, data: PaymentDto): Promise<string | null> {
        try {
            const { data: response } = await instance.put<ApiResponse<UUID>>(`/payable/payments/${id}`, data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error updating payment:', response.message);
            return Promise.reject(response.message || "Ödeme güncellenirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Ödeme güncellenirken hata oluştu");
        }
    }

    static async Delete(id: UUID): Promise<boolean> {
        try {
            const { data: response } = await instance.delete<ApiResponse<null>>(`/payable/payments/${id}`);

            if (response.status === 200) {
                return Promise.resolve(true);
            }

            Logger.error('Error deleting payment:', response.message);
            return Promise.reject(response.message || "Ödeme silinirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Ödeme silinirken hata oluştu");
        }
    }
}