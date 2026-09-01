import instance from "../instance";
import type { ApiResponse, Employee, EmployeeAdvance, EmployeeGarnishment, EmployeeAttendance, EmployeePayroll } from "@common";

import { Logger } from "../utils/logger";

export const EmployeeApi = {
	async GetAllEmployees(): Promise<Employee[]> {
		try {
			const { data: res } = await instance.get<ApiResponse<Employee[]>>("/employees/list");
			if (res.success && res.data) return res.data;
			return [];
		} catch (error) {
			Logger.error("Error fetching employees:", error);
			return Promise.reject("Çalışanlar getirilemedi");
		}
	},

	async CreateEmployee(data: Partial<Employee>): Promise<Employee> {
		const { data: res } = await instance.post<ApiResponse<Employee>>("/employees/list", data);
		if (res.success && res.data) return res.data;
		return Promise.reject(res.message || "Çalışan eklenemedi");
	},

	async UpdateEmployee(id: string, data: Partial<Employee>): Promise<void> {
		const { data: res } = await instance.put<ApiResponse<void>>(`/employees/list/${id}`, data);
		if (!res.success) return Promise.reject(res.message || "Çalışan güncellenemedi");
	},

	async DeleteEmployee(id: string): Promise<void> {
		const { data: res } = await instance.delete<ApiResponse<void>>(`/employees/list/${id}`);
		if (!res.success) return Promise.reject(res.message || "Çalışan silinemedi");
	},

	// Advances
	async GetAdvances(): Promise<EmployeeAdvance[]> {
		const { data: res } = await instance.get<ApiResponse<EmployeeAdvance[]>>("/employees/advances");
		if (res.success && res.data) return res.data;
		return [];
	},

	async CreateAdvance(data: Partial<EmployeeAdvance>): Promise<EmployeeAdvance> {
		const { data: res } = await instance.post<ApiResponse<EmployeeAdvance>>("/employees/advances", data);
		if (res.success && res.data) return res.data;
		return Promise.reject(res.message || "Avans eklenemedi");
	},

	async UpdateAdvance(id: string, data: Partial<EmployeeAdvance>): Promise<void> {
		const { data: res } = await instance.put<ApiResponse<void>>(`/employees/advances/${id}`, data);
		if (!res.success) return Promise.reject(res.message || "Avans güncellenemedi");
	},

	async DeleteAdvance(id: string): Promise<void> {
		const { data: res } = await instance.delete<ApiResponse<void>>(`/employees/advances/${id}`);
		if (!res.success) return Promise.reject(res.message || "Avans silinemedi");
	},

	// Garnishments
	async GetGarnishments(): Promise<EmployeeGarnishment[]> {
		const { data: res } = await instance.get<ApiResponse<EmployeeGarnishment[]>>("/employees/garnishments");
		if (res.success && res.data) return res.data;
		return [];
	},

	async CreateGarnishment(data: Partial<EmployeeGarnishment>): Promise<EmployeeGarnishment> {
		const { data: res } = await instance.post<ApiResponse<EmployeeGarnishment>>("/employees/garnishments", data);
		if (res.success && res.data) return res.data;
		return Promise.reject(res.message || "İcra dosyası eklenemedi");
	},

	async UpdateGarnishment(id: string, data: Partial<EmployeeGarnishment>): Promise<void> {
		const { data: res } = await instance.put<ApiResponse<void>>(`/employees/garnishments/${id}`, data);
		if (!res.success) return Promise.reject(res.message || "İcra dosyası güncellenemedi");
	},

	async DeleteGarnishment(id: string): Promise<void> {
		const { data: res } = await instance.delete<ApiResponse<void>>(`/employees/garnishments/${id}`);
		if (!res.success) return Promise.reject(res.message || "İcra dosyası silinemedi");
	},

	// Attendance (PDKS)
	async GetAttendance(params?: { startDate?: string; endDate?: string; employeeId?: string }): Promise<EmployeeAttendance[]> {
		const query = new URLSearchParams();
		if (params?.startDate) query.append("startDate", params.startDate);
		if (params?.endDate) query.append("endDate", params.endDate);
		if (params?.employeeId) query.append("employeeId", params.employeeId);

		const { data: res } = await instance.get<ApiResponse<EmployeeAttendance[]>>(`/employees/attendance?${query.toString()}`);
		if (res.success && res.data) return res.data;
		return [];
	},

	async SaveAttendance(data: Partial<EmployeeAttendance>): Promise<void> {
		const { data: res } = await instance.post<ApiResponse<void>>("/employees/attendance", data);
		if (!res.success) return Promise.reject(res.message || "PDKS kaydı kaydedilemedi");
	},

	async BatchSaveAttendance(items: Partial<EmployeeAttendance>[]): Promise<void> {
		const { data: res } = await instance.post<ApiResponse<void>>("/employees/attendance/batch", items);
		if (!res.success) return Promise.reject(res.message || "Toplu puantaj kaydedilemedi");
	},

	async DeleteAttendance(id: string): Promise<void> {
		const { data: res } = await instance.delete<ApiResponse<void>>(`/employees/attendance/${id}`);
		if (!res.success) return Promise.reject(res.message || "Kayıt silinemedi");
	},

	// Payroll
	async GetPayrolls(year?: number, month?: number): Promise<EmployeePayroll[]> {
		const query = new URLSearchParams();
		if (year) query.append("year", year.toString());
		if (month) query.append("month", month.toString());

		const { data: res } = await instance.get<ApiResponse<EmployeePayroll[]>>(`/employees/payroll?${query.toString()}`);
		if (res.success && res.data) return res.data;
		return [];
	},

	async CalculatePayrollPreview(employeeId: string, year: number, month: number): Promise<Partial<EmployeePayroll>> {
		const query = new URLSearchParams({ employee_id: employeeId, year: year.toString(), month: month.toString() });
		const { data: res } = await instance.get<ApiResponse<Partial<EmployeePayroll>>>(`/employees/payroll/calculate-preview?${query.toString()}`);
		if (res.success && res.data) return res.data;
		return Promise.reject(res.message || "Bordro öngörüsü hesaplanamadı");
	},

	async SavePayroll(data: Partial<EmployeePayroll>): Promise<void> {
		const { data: res } = await instance.post<ApiResponse<void>>("/employees/payroll", data);
		if (!res.success) return Promise.reject(res.message || "Bordro kaydedilemedi");
	},

	async DeletePayroll(id: string): Promise<void> {
		const { data: res } = await instance.delete<ApiResponse<void>>(`/employees/payroll/${id}`);
		if (!res.success) return Promise.reject(res.message || "Bordro silinemedi");
	},
};
