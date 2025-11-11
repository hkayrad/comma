import instance from "../instance";
import type { ApiResponse, CustomerDto, CustomerIdName, CustomerStatement, UUID } from "../../../../common/types";
import { Logger } from "../utils/logger";

export class ReceivableCustomerApi {
    static async Create(data: CustomerDto): Promise<UUID | null> {
        try {
            const { data: response } = await instance.post<ApiResponse<UUID>>("/receivable/customers", data);

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
            const { data: response } = await instance.get<ApiResponse<CustomerDto[]>>("/receivable/customers");

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
            const { data: response } = await instance.get<ApiResponse<CustomerIdName[]>>("/receivable/customers/id-name");

            if (response.status === 200) {
                return Promise.resolve(response.data || []);
            }

            Logger.error('Error fetching customers:', response.message);
            return Promise.reject(response.message || "Müşteriler getirilirken hata oluştu");
        } catch (error) {
            return Promise.reject("Müşteriler getirilirken hata oluştu");
        }
    }

    static async GetStatement(id: string): Promise<CustomerStatement | null> {
        try {
            const { data: response } = await instance.get<ApiResponse<CustomerStatement>>(`/receivable/customers/${id}/statement`);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error fetching customer statement:', response.message);
            return Promise.reject(response.message || "Müşteri borç dökümü getirilirken hata oluştu");
        } catch (error) {
            return Promise.reject("Müşteri borç dökümü getirilirken hata oluştu");
        }
    }

    static async Update(id: string, data: CustomerDto): Promise<string | null> {
        try {
            const { data: response } = await instance.put<ApiResponse<UUID>>(`/receivable/customers/${id}`, data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error updating customer:', response.message);
            return Promise.reject(response.message || "Müşteri güncellenirken hata oluştu");
        } catch (error) {
            return Promise.reject("Müşteri güncellenirken hata oluştu");
        }
    }

    static async Delete(id: string): Promise<void> {
        try {
            const { data: response } = await instance.delete<ApiResponse<null>>(`/receivable/customers/${id}`);

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

export class PayableCustomerApi {
    static async Create(data: CustomerDto): Promise<UUID | null> {
        try {
            const { data: response } = await instance.post<ApiResponse<UUID>>("/payable/customers", data);

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
            const { data: response } = await instance.get<ApiResponse<CustomerDto[]>>("/payable/customers");

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
            const { data: response } = await instance.get<ApiResponse<CustomerIdName[]>>("/payable/customers/id-name");

            if (response.status === 200) {
                return Promise.resolve(response.data || []);
            }

            Logger.error('Error fetching customers:', response.message);
            return Promise.reject(response.message || "Müşteriler getirilirken hata oluştu");
        } catch (error) {
            return Promise.reject("Müşteriler getirilirken hata oluştu");
        }
    }

    static async GetStatement(id: string): Promise<CustomerStatement | null> {
        try {
            const { data: response } = await instance.get<ApiResponse<CustomerStatement>>(`/payable/customers/${id}/statement`);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error fetching customer statement:', response.message);
            return Promise.reject(response.message || "Müşteri borç dökümü getirilirken hata oluştu");
        } catch (error) {
            return Promise.reject("Müşteri borç dökümü getirilirken hata oluştu");
        }
    }

    static async Update(id: string, data: CustomerDto): Promise<string | null> {
        try {
            const { data: response } = await instance.put<ApiResponse<UUID>>(`/payable/customers/${id}`, data);

            if (response.status === 200) {
                return Promise.resolve(response.data);
            }

            Logger.error('Error updating customer:', response.message);
            return Promise.reject(response.message || "Müşteri güncellenirken hata oluştu");
        } catch (error) {
            return Promise.reject("Müşteri güncellenirken hata oluştu");
        }
    }

    static async Delete(id: string): Promise<void> {
        try {
            const { data: response } = await instance.delete<ApiResponse<null>>(`/payable/customers/${id}`);

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