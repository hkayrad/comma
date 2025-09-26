import instance from "../instance";
import type { ApiResponse, CustomerDto, CustomerIdName, UUID } from "../types";
import { Logger } from "../utils/logger";

export class CustomerApi {
    static async Create(data: CustomerDto): Promise<UUID | null> {
        try {
            const { data: response } = await instance.post<ApiResponse<UUID>>("/customers", data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error creating customer:', response.message);
            return Promise.reject(response.message || "Müşteri eklenirken hata oluştu");
        }
        catch (error) {
            return Promise.reject("Müşteri eklenirken hata oluştu");
        }
    }

    static async GetAll(): Promise<CustomerDto[]> {
        try {
            const { data: response } = await instance.get<ApiResponse<CustomerDto[]>>("/customers");

            if (response.status === 200) {
                return Promise.resolve(response.data || []);
            }

            Logger.error('Error fetching customers:', response.message);
            return Promise.reject(response.message || "Müşteriler getirilirken hata oluştu");
        } catch (error) {
            return Promise.reject("Müşteriler getirilirken hata oluştu");
        }
    }

    static async GetIdAndName(): Promise<CustomerIdName[]> {
        try {
            const { data: response } = await instance.get<ApiResponse<CustomerIdName[]>>("/customers/id-name");

            if (response.status === 200) {
                return Promise.resolve(response.data || []);
            }

            Logger.error('Error fetching customers:', response.message);
            return Promise.reject(response.message || "Müşteriler getirilirken hata oluştu");
        } catch (error) {
            return Promise.reject("Müşteriler getirilirken hata oluştu");
        }
    }

    static async Delete(id: string): Promise<void> {
        try {
            const { data: response } = await instance.delete<ApiResponse<null>>(`/customers/${id}`);

            if (response.status === 200) {
                return Promise.resolve();
            }

            Logger.error('Error deleting customer:', response.message);
            return Promise.reject(response.message || "Müşteri silinirken hata oluştu");
        } catch (error) {
            return Promise.reject("Müşteri silinirken hata oluştu");
        }
    }
}