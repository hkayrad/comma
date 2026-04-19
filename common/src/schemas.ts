import { z } from "zod";

// ── Customer ──
export const customerSchema = z.object({
	name: z.string().min(1, "Name is required").max(255),
	phone: z.string().max(50).nullish(),
	is_company: z.boolean(),
	tax_number: z.string().max(50).nullish(),
	tax_office: z.string().max(100).nullish(),
	mersis_no: z.string().max(50).nullish(),
	email: z.string().email().max(255).nullish().or(z.literal("")),
	address: z.string().max(500).nullish(),
});

// ── Debt ──
export const debtSchema = z.object({
	customer_id: z.string().uuid("Invalid customer ID"),
	invoice_no: z.string().max(100).nullish(),
	amount: z.number().min(0, "Amount must be non-negative"),
	vat: z.number().min(0),
	withholding: z.number().min(0).default(0),
	currency: z.enum(["TRY", "USD", "EUR"]),
	exchange_rate: z.number().positive("Exchange rate must be positive"),
	discount: z.number().min(0).default(0),
	description: z.string().max(500).nullish(),
	issue_date: z.coerce.date(),
	due_date: z.coerce.date().nullish(),
});

// ── Payment ──
export const paymentSchema = z.object({
	customer_id: z.string().uuid("Invalid customer ID"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.enum(["TRY", "USD", "EUR"]),
	exchange_rate: z.number().positive("Exchange rate must be positive"),
	payment_method: z.enum(["cash", "bank_transfer", "check", "card"]),
	description: z.string().max(500).nullish(),
	invoice_no: z.string().max(100).nullish(),
	payment_date: z.coerce.date(),
	due_date: z.coerce.date().nullish(),
});

// ── Company ──
export const companySchema = z.object({
	name: z.string().min(1, "Company name is required").max(255),
	is_company: z.boolean(),
	phone: z.string().max(50).nullish(),
	tax_number: z.string().max(50).nullish(),
	tax_office: z.string().max(100).nullish(),
	mersis_no: z.string().max(50).nullish(),
	email: z.string().email().max(255).nullish().or(z.literal("")),
	address: z.string().max(500).nullish(),
});

// ── Auth ──
export const loginSchema = z.object({
	username: z.string().min(1, "Username is required").max(100),
	password: z.string().min(1, "Password is required").max(200),
});

// ── User Management ──
export const createUserSchema = z.object({
	company_id: z.string().uuid("Invalid company ID"),
	username: z.string().min(3, "Username must be at least 3 characters").max(50),
	password: z.string().min(6, "Password must be at least 6 characters").max(100),
	role: z.number().int().min(0).max(99).default(0),
});

// ── Config ──
export const configSchema = z.object({
	configKey: z.string().min(1, "Config key is required"),
	configValue: z.string().min(1, "Config value is required"),
});

// ── User Settings ──
export const updateUsernameSchema = z.object({
	newUsername: z.string().min(3, "Username must be at least 3 characters").max(50),
	currentPassword: z.string().min(1, "Current password is required"),
});

export const updatePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(6, "New password must be at least 6 characters").max(100),
});

// ── Pagination / Query Params ──
export const paginationSchema = z.object({
	page: z.coerce.number().int().min(0).default(0),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	sorting: z.string().optional().transform((val) => {
		if (!val) return [];
		try { return JSON.parse(val); } catch { return []; }
	}),
	filters: z.string().optional().transform((val) => {
		if (!val) return [];
		try { return JSON.parse(val); } catch { return []; }
	}),
});
