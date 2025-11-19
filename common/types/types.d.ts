//! BUNLARI AYRI DOSYALARA AYIR

export type OverviewViewType = "receivable" | "payable";
export type AvailableCurrency = "TRY" | "USD" | "EUR";
export type AvailablePaymentMethod = "cash" | "bank_transfer" | "check" | "card";

export type ApiResponse<T> = {
	status: number;
	data: T | null;
	message: string;
};

export type UUID = string;

export type ConfigKey = string;
export type ConfigValue = string;
export type ConfigDto = {
	configKey: ConfigKey;
	configValue: ConfigValue;
};

export type LogoSize = "small" | "large";

export type DecodedJwtToken = {
	aud: string;
	exp: number;
	iat: number;
	id: string;
	iss: string;
	username: string;
	companyId: string;
	role: number;
};

export type CustomerDto = {
	id?: UUID;
	name: string;
	phone?: string;
	is_company: boolean;
	tax_number?: string;
	tax_office?: string;
	mersis_no?: string;
	email?: string;
	address?: string;
	total_debt_try?: number;
	total_debt_usd?: number;
	total_debt_eur?: number;
	total_payments_try?: number;
	total_payments_usd?: number;
	total_payments_eur?: number;
	remaining_debt_try?: number;
	remaining_debt_usd?: number;
	remaining_debt_eur?: number;
	created_at?: Date;
	updated_at?: Date;
};

export type DebtDto = {
	id?: UUID;
	customer_id: UUID;
	invoice_no?: string;
	amount: number;
	vat: number;
	currency: AvailableCurrency;
	total_amount?: string;
	description?: string;
	issue_date: Date;
	created_at?: Date;
	updated_at?: Date;
};

export type PaymentDto = {
	id?: UUID;
	customer_id: UUID;
	amount: number;
	currency: AvailableCurrency;
	payment_method: AvailablePaymentMethod;
	description?: string;
	invoice_no?: string;
	payment_date: Date;
	created_at?: Date;
	updated_at?: Date;
};

export type CompanyDto = {
	id?: UUID;
	name: string;
	is_company: boolean;
	address?: string;
	phone?: string;
	email?: string;
	tax_number?: string;
	tax_office?: string;
	mersis_no?: string;
	small_logo_path?: string;
	large_logo_path?: string;
	created_at?: Date;
	updated_at?: Date;
};

export type CustomerIdName = { id: UUID; name: string };

export type Totals = {
	total_debts: number;
	total_payments: number;
	remaining_debt: number;
};

export type CustomerStatement = {
	customer: CustomerDto;
	debts: DebtDto[];
	payments: PaymentDto[];
};

export type ExchangeRates = {
	date: string;
	usd: {
		forexBuying: string;
		forexSelling: string;
		banknoteBuying: string;
		banknoteSelling: string;
	};
	eur: {
		forexBuying: string;
		forexSelling: string;
		banknoteBuying: string;
		banknoteSelling: string;
	};
	gbp: {
		forexBuying: string;
		forexSelling: string;
		banknoteBuying: string;
		banknoteSelling: string;
	};
};

export type InsertResult = {
	affectedRows: number;
	id: string;
};
