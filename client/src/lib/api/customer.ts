import instance from "../instance";
import type { ApiResponse, CustomerDto, CustomerIdName, CustomerStatement, UUID } from "../../../../common/types";
import { Logger } from "../utils/logger";

export class ReceivableCustomerApi {
	static async Create(data: CustomerDto): Promise<UUID | null> {
		try {
			const { data: response } = await instance.post<ApiResponse<UUID>>("/receivables/customers", data);

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error creating customer:", response.message);
			return Promise.reject(response.message || "Müşteri eklenirken hata oluştu");
		} catch (error) {
			Logger.error("Error creating customer:", error);
			return Promise.reject("Müşteri eklenirken hata oluştu");
		}
	}

	static async GetAll(): Promise<CustomerDto[]> {
		try {
			const { data: response } = await instance.get<ApiResponse<CustomerDto[]>>("/receivables/customers");

			if (response.status === 200) {
				return Promise.resolve(response.data || []);
			}

			Logger.error("Error fetching customers:", response.message);
			return Promise.reject(response.message || "Müşteriler getirilirken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching customers:", error);
			return Promise.reject("Müşteriler getirilirken hata oluştu");
		}
	}

	static async GetIdAndName(): Promise<CustomerIdName[]> {
		try {
			const { data: response } = await instance.get<ApiResponse<CustomerIdName[]>>("/receivables/customers/id-name");

			if (response.status === 200) {
				return Promise.resolve(response.data || []);
			}

			Logger.error("Error fetching customers:", response.message);
			return Promise.reject(response.message || "Müşteriler getirilirken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching customers:", error);
			return Promise.reject("Müşteriler getirilirken hata oluştu");
		}
	}

	static async GetStatement(id: string): Promise<CustomerStatement | null> {
		try {
			const { data: response } = await instance.get<ApiResponse<CustomerStatement>>(
				`/receivables/customers/${id}/statement`,
			);

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error fetching customer statement:", response.message);
			return Promise.reject(response.message || "Müşteri borç dökümü getirilirken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching customer statement:", error);
			return Promise.reject("Müşteri borç dökümü getirilirken hata oluştu");
		}
	}

	static async Update(id: string, data: CustomerDto): Promise<string | null> {
		try {
			const { data: response } = await instance.put<ApiResponse<UUID>>(`/receivables/customers/${id}`, data);

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error updating customer:", response.message);
			return Promise.reject(response.message || "Müşteri güncellenirken hata oluştu");
		} catch (error) {
			Logger.error("Error updating customer:", error);
			return Promise.reject("Müşteri güncellenirken hata oluştu");
		}
	}

	static async Delete(id: string): Promise<void> {
		try {
			const { data: response } = await instance.delete<ApiResponse<null>>(`/receivables/customers/${id}`);

			if (response.status === 200) {
				return Promise.resolve();
			}

			Logger.error("Error deleting customer:", response.message);
			return Promise.reject(response.message || "Müşteri silinirken hata oluştu");
		} catch (error) {
			Logger.error("Error deleting customer:", error);
			return Promise.reject("Müşteri silinirken hata oluştu");
		}
	}
}

export class PayableCustomerApi {
	static async Create(data: CustomerDto): Promise<UUID | null> {
		try {
			const { data: response } = await instance.post<ApiResponse<UUID>>("/payables/customers", data);

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error creating customer:", response.message);
			return Promise.reject(response.message || "Müşteri eklenirken hata oluştu");
		} catch (error) {
			Logger.error("Error creating customer:", error);
			return Promise.reject("Müşteri eklenirken hata oluştu");
		}
	}

	static async GetAll(): Promise<CustomerDto[]> {
		try {
			const { data: response } = await instance.get<ApiResponse<CustomerDto[]>>("/payables/customers");

			if (response.status === 200) {
				return Promise.resolve(response.data || []);
			}

			Logger.error("Error fetching customers:", response.message);
			return Promise.reject(response.message || "Müşteriler getirilirken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching customers:", error);
			return Promise.reject("Müşteriler getirilirken hata oluştu");
		}
	}

	static async GetIdAndName(): Promise<CustomerIdName[]> {
		try {
			const { data: response } = await instance.get<ApiResponse<CustomerIdName[]>>("/payables/customers/id-name");

			if (response.status === 200) {
				return Promise.resolve(response.data || []);
			}

			Logger.error("Error fetching customers:", response.message);
			return Promise.reject(response.message || "Müşteriler getirilirken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching customers:", error);
			return Promise.reject("Müşteriler getirilirken hata oluştu");
		}
	}

	static async GetStatement(id: string): Promise<CustomerStatement | null> {
		try {
			const { data: response } = await instance.get<ApiResponse<CustomerStatement>>(
				`/payables/customers/${id}/statement`,
			);

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error fetching customer statement:", response.message);
			return Promise.reject(response.message || "Müşteri borç dökümü getirilirken hata oluştu");
		} catch (error) {
			Logger.error("Error fetching customer statement:", error);
			return Promise.reject("Müşteri borç dökümü getirilirken hata oluştu");
		}
	}

	static async Update(id: string, data: CustomerDto): Promise<string | null> {
		try {
			const { data: response } = await instance.put<ApiResponse<UUID>>(`/payables/customers/${id}`, data);

			if (response.status === 200) {
				return Promise.resolve(response.data);
			}

			Logger.error("Error updating customer:", response.message);
			return Promise.reject(response.message || "Müşteri güncellenirken hata oluştu");
		} catch (error) {
			Logger.error("Error updating customer:", error);
			return Promise.reject("Müşteri güncellenirken hata oluştu");
		}
	}

	static async Delete(id: string): Promise<void> {
		try {
			const { data: response } = await instance.delete<ApiResponse<null>>(`/payables/customers/${id}`);

			if (response.status === 200) {
				return Promise.resolve();
			}

			Logger.error("Error deleting customer:", response.message);
			return Promise.reject(response.message || "Müşteri silinirken hata oluştu");
		} catch (error) {
			Logger.error("Error deleting customer:", error);
			return Promise.reject("Müşteri silinirken hata oluştu");
		}
	}
}
