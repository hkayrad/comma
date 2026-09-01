import { z } from "zod";

export const employeeSchema = z.object({
	tc_no: z.string().max(11).nullish().or(z.literal("")),
	first_name: z.string().min(1, "Ad gereklidir").max(100),
	last_name: z.string().min(1, "Soyad gereklidir").max(100),
	title: z.string().max(100).nullish().or(z.literal("")),
	department: z.string().max(100).nullish().or(z.literal("")),
	phone: z.string().max(20).nullish().or(z.literal("")),
	email: z.string().email().max(255).nullish().or(z.literal("")),
	address: z.string().max(500).nullish().or(z.literal("")),
	hire_date: z.string().min(1, "İşe giriş tarihi gereklidir"),
	termination_date: z.string().nullish().or(z.literal("")),
	iban: z.string().max(34).nullish().or(z.literal("")),
	bank_name: z.string().max(100).nullish().or(z.literal("")),
	base_salary: z.coerce.number().min(0, "Taban maaş negatif olamaz"),
	salary_currency: z.string().default("TRY"),
});

export const advanceSchema = z.object({
	employee_id: z.string().uuid("Geçerli çalışan seçiniz"),
	amount: z.coerce.number().positive("Avans tutarı 0'dan büyük olmalıdır"),
	request_date: z.string().min(1, "Talep tarihi gereklidir"),
	payment_date: z.string().nullish().or(z.literal("")),
	status: z.enum(["PENDING", "APPROVED", "REJECTED", "DEDUCTED"]).default("APPROVED"),
	description: z.string().max(500).nullish().or(z.literal("")),
});

export const garnishmentSchema = z.object({
	employee_id: z.string().uuid("Geçerli çalışan seçiniz"),
	file_no: z.string().min(1, "İcra dosya numarası gereklidir").max(100),
	execution_office: z.string().min(1, "İcra dairesi gereklidir").max(150),
	total_debt: z.coerce.number().positive("Toplam borç 0'dan büyük olmalıdır"),
	deduction_type: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
	deduction_value: z.coerce.number().positive("Kesinti değeri 0'dan büyük olmalıdır"),
	start_date: z.string().nullish().or(z.literal("")),
	paid_amount: z.coerce.number().min(0).default(0),
	status: z.enum(["ACTIVE", "COMPLETED", "PAUSED"]).default("ACTIVE"),
	notes: z.string().max(500).nullish().or(z.literal("")),
});


export const attendanceSchema = z.object({
	employee_id: z.string().uuid("Geçerli çalışan seçiniz"),
	date: z.string().min(1, "Tarih gereklidir"),
	check_in_time: z.string().nullish().or(z.literal("")),
	check_out_time: z.string().nullish().or(z.literal("")),
	status: z.enum([
		"PRESENT",
		"ABSENT_UNEXCUSED",
		"ABSENT_EXCUSED",
		"ANNUAL_LEAVE",
		"SICK_LEAVE",
		"UNPAID_LEAVE",
		"HALF_DAY",
	]).default("PRESENT"),
	overtime_hours: z.coerce.number().min(0).default(0),
	overtime_multiplier: z.coerce.number().min(1).default(1.5),
	notes: z.string().max(500).nullish().or(z.literal("")),
});

export const batchAttendanceSchema = z.array(attendanceSchema);

export const payrollSchema = z.object({
	employee_id: z.string().uuid("Geçerli çalışan seçiniz"),
	period_year: z.coerce.number().int().min(2000).max(2100),
	period_month: z.coerce.number().int().min(1).max(12),
	base_salary: z.coerce.number().min(0),
	working_days: z.coerce.number().min(0).default(30),
	absent_days: z.coerce.number().min(0).default(0),
	absence_deduction: z.coerce.number().min(0).default(0),
	overtime_pay: z.coerce.number().min(0).default(0),
	bonus_pay: z.coerce.number().min(0).default(0),
	advance_deduction: z.coerce.number().min(0).default(0),
	garnishment_deduction: z.coerce.number().min(0).default(0),
	net_payable: z.coerce.number(),
	payment_status: z.enum(["DRAFT", "APPROVED", "PAID"]).default("DRAFT"),
	payment_date: z.string().nullish().or(z.literal("")),
});
