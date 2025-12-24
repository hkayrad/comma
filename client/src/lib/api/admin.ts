import instance from "../instance";
import type { CompanyDto, UserDto, CreateUserDto } from "../../../../common/types";
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
				status: number;
				data: { rows: CompanyDto[]; count: number };
				message: string;
			}>(`/admin/companies?${params.toString()}`);

			if (response.status === 200) {
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
				status: number;
				data: { rows: UserDto[]; count: number };
				message: string;
			}>(`/admin/users/company/${companyId}?${params.toString()}`);

			if (response.status === 200) {
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

	static async ResetPassword(id: string, password: string) {
		try {
			const response = await instance.post(`/admin/users/${id}/reset-password`, { password });
			return response.data;
		} catch (error) {
			Logger.error(`Error resetting password for user ${id}:`, error);
			throw error;
		}
	}
}