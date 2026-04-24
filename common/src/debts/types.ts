import type { UUID, AvailableCurrency } from "../shared/types";

export type DebtDto = {
	id?: UUID;
	company_id?: UUID;
	customer_id: UUID;
	invoice_no?: string | null;
	amount: number;
	vat: number;
	withholding: number;
	currency: AvailableCurrency;
	exchange_rate: number;
	discount: number;
	total?: number;
	total_in_try?: number;
	description?: string | null;
	issue_date: Date;
	due_date?: Date | null;
	created_at?: Date;
	created_by?: UUID;
	updated_at?: Date;
	deleted_at?: Date;
	deleted_by?: UUID;
	is_paid?: boolean;
	last_payment_date?: Date | null;
};

export type UpcomingDueDate = {
	id: UUID;
	customer_name: string;
	total: number;
	currency: AvailableCurrency;
	due_date: Date;
	days_remaining: number;
};
