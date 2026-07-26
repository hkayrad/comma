import instance from "../instance";
import type { CompanyDto, UserDto, CreateUserDto } from "@comma/common";
import { Logger } from "../utils/logger";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";

export class AdminCompanyApi {
	static async GetAll(
		page: number = 0,
		pageSize: number = 20,
		sorting?: SortingState,
		filters?: ColumnFiltersState,
	): Promise<{ rows: CompanyDto[]; count: number } | null> {
		try {
			const params = new URLSearchParams();
			params.append("page", page.toString());
			params.append("limit", pageSize.toString());
			if (sorting) params.append("sorting", JSON.stringify(sorting));
			if (filters) params.append("filters", JSON.stringify(filters));

			const { data: response } = await instance.get<{
				success: boolean;
				data: { rows: CompanyDto[]; count: number };
				message: string;
			}>(`/admin/companies?${params.toString()}`);

			if (response.success) {
				return response.data;
			}
			return null;
		} catch (error) {
			Logger.error("Error fetching companies:", error);
			throw error;
		}
	}

	static async GetById(id: string) {
		try {
			const response = await instance.get(`/admin/companies/${id}`);
			return response.data;
		} catch (error) {
			Logger.error(`Error fetching company ${id}:`, error);
			throw error;
		}
	}

	static async Create(company: CompanyDto) {
		try {
			const response = await instance.post("/admin/companies", company);
			return response.data;
		} catch (error) {
			Logger.error("Error creating company:", error);
			throw error;
		}
	}

	static async Update(id: string, company: CompanyDto) {
		try {
			const response = await instance.put(`/admin/companies/${id}`, company);
			return response.data;
		} catch (error) {
			Logger.error(`Error updating company ${id}:`, error);
			throw error;
		}
	}

	static async Delete(id: string) {
		try {
			const response = await instance.delete(`/admin/companies/${id}`);
			return response.data;
		} catch (error) {
			Logger.error(`Error deleting company ${id}:`, error);
			throw error;
		}
	}

	static async Restore(id: string) {
		try {
			const response = await instance.post(`/admin/companies/${id}/restore`);
			return response.data;
		} catch (error) {
			Logger.error(`Error restoring company ${id}:`, error);
			throw error;
		}
	}

	static async DeleteBatch(ids: string[]) {
		try {
			const response = await instance.post("/admin/companies/bulk-delete", { ids });
			return response.data;
		} catch (error) {
			Logger.error("Error bulk deleting companies:", error);
			throw error;
		}
	}
}

export class AdminUserApi {
	static async GetAllByCompany(
		companyId: string,
		page: number = 0,
		pageSize: number = 20,
		sorting?: SortingState,
		filters?: ColumnFiltersState,
	): Promise<{ rows: UserDto[]; count: number } | null> {
		try {
			const params = new URLSearchParams();
			params.append("page", page.toString());
			params.append("limit", pageSize.toString());
			if (sorting) params.append("sorting", JSON.stringify(sorting));
			if (filters) params.append("filters", JSON.stringify(filters));

			const { data: response } = await instance.get<{
				success: boolean;
				data: { rows: UserDto[]; count: number };
				message: string;
			}>(`/admin/users/company/${companyId}?${params.toString()}`);

			if (response.success) {
				return response.data;
			}
			return null;
		} catch (error) {
			Logger.error("Error fetching users:", error);
			throw error;
		}
	}

	static async GetById(id: string) {
		try {
			const response = await instance.get(`/admin/users/${id}`);
			return response.data;
		} catch (error) {
			Logger.error(`Error fetching user ${id}:`, error);
			throw error;
		}
	}

	static async Create(user: CreateUserDto) {
		try {
			const response = await instance.post("/admin/users", user);
			return response.data;
		} catch (error) {
			Logger.error("Error creating user:", error);
			throw error;
		}
	}

	static async Update(id: string, user: Partial<UserDto & { password?: string }>) {
		try {
			const response = await instance.put(`/admin/users/${id}`, user);
			return response.data;
		} catch (error) {
			Logger.error(`Error updating user ${id}:`, error);
			throw error;
		}
	}

	static async Delete(id: string) {
		try {
			const response = await instance.delete(`/admin/users/${id}`);
			return response.data;
		} catch (error) {
			Logger.error(`Error deleting user ${id}:`, error);
			throw error;
		}
	}

	static async Restore(id: string) {
		try {
			const response = await instance.post(`/admin/users/${id}/restore`);
			return response.data;
		} catch (error) {
			Logger.error(`Error restoring user ${id}:`, error);
			throw error;
		}
	}

	static async ResetPassword(id: string, password: string) {
		try {
			const response = await instance.post(`/admin/users/${id}/reset-password`, { password });
			return response.data;
		} catch (error) {
			Logger.error(`Error resetting password for user ${id}:`, error);
			throw error;
		}
	}

	static async DeleteBatch(ids: string[]) {
		try {
			const response = await instance.post("/admin/users/bulk-delete", { ids });
			return response.data;
		} catch (error) {
			Logger.error("Error bulk deleting users:", error);
			throw error;
		}
	}
}

export class AuditLogApi {
	static async GetAll(
		page: number = 0,
		pageSize: number = 20,
		sorting?: SortingState,
		filters?: ColumnFiltersState,
	): Promise<{ rows: any[]; count: number } | null> {
		try {
			const params = new URLSearchParams();
			params.append("page", (page + 1).toString());
			params.append("limit", pageSize.toString());
			if (sorting) params.append("sorting", JSON.stringify(sorting));
			if (filters) params.append("filters", JSON.stringify(filters));

			const { data: response } = await instance.get<{
				success: boolean;
				data: { data?: any[]; rows?: any[]; total?: number; count?: number };
				message: string;
			}>(`/admin/audit-logs?${params.toString()}`);

			if (response.success && response.data) {
				return {
					rows: response.data.rows || response.data.data || [],
					count: response.data.count ?? response.data.total ?? 0,
				};
			}
			return null;
		} catch (error) {
			Logger.error("Error fetching audit logs:", error);
			throw error;
		}
	}
}