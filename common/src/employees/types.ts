export interface Employee {
	id: string;
	company_id: string;
	tc_no?: string | null;
	first_name: string;
	last_name: string;
	title?: string | null;
	department?: string | null;
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	hire_date: string;
	termination_date?: string | null;
	iban?: string | null;
	bank_name?: string | null;
	base_salary: number;
	cash_salary?: number;
	salary_currency: string;
	created_at?: string;
	updated_at?: string;
	deleted_at?: string | null;
}

export type EmployeeAdvanceStatus = "PENDING" | "APPROVED" | "REJECTED" | "DEDUCTED";

export interface EmployeeAdvance {
	id: string;
	company_id: string;
	employee_id: string;
	employee_name?: string;
	amount: number;
	request_date: string;
	payment_date?: string | null;
	status: EmployeeAdvanceStatus;
	description?: string | null;
	created_at?: string;
	updated_at?: string;
}

export type GarnishmentDeductionType = "PERCENTAGE" | "FIXED";
export type GarnishmentStatus = "ACTIVE" | "COMPLETED" | "PAUSED";

export interface EmployeeGarnishment {
	id: string;
	company_id: string;
	employee_id: string;
	employee_name?: string;
	file_no: string;
	execution_office: string;
	total_debt: number;
	deduction_type: GarnishmentDeductionType;
	deduction_value: number;
	start_date?: string | null;
	paid_amount: number;

	remaining_debt?: number;
	status: GarnishmentStatus;
	notes?: string | null;
	created_at?: string;
	updated_at?: string;
}

export type AttendanceStatus =
	| "PRESENT"
	| "ABSENT_UNEXCUSED"
	| "ABSENT_EXCUSED"
	| "ANNUAL_LEAVE"
	| "SICK_LEAVE"
	| "UNPAID_LEAVE"
	| "HALF_DAY";

export interface EmployeeAttendance {
	id: string;
	company_id: string;
	employee_id: string;
	employee_name?: string;
	date: string;
	check_in_time?: string | null;
	check_out_time?: string | null;
	status: AttendanceStatus;
	overtime_hours: number;
	overtime_multiplier: number;
	notes?: string | null;
	created_at?: string;
	updated_at?: string;
}

export type PayrollPaymentStatus = "DRAFT" | "APPROVED" | "PAID";

export interface EmployeePayroll {
	id: string;
	company_id: string;
	employee_id: string;
	employee_name?: string;
	period_year: number;
	period_month: number;
	base_salary: number;
	cash_salary?: number;
	working_days: number;
	absent_days: number;
	absence_deduction: number;
	overtime_pay: number;
	bonus_pay: number;
	advance_deduction: number;
	garnishment_deduction: number;
	net_payable: number;
	payment_status: PayrollPaymentStatus;
	payment_date?: string | null;
	created_at?: string;
	updated_at?: string;
}
