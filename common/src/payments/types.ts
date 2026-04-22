import type { UUID, AvailableCurrency } from "../shared/types";

export type AvailablePaymentMethod = "cash" | "bank_transfer" | "check" | "card";

export type PaymentDto = {
	id?: UUID;
	customer_id: UUID;
	amount: number;
	currency: AvailableCurrency;
	exchange_rate: number;
	amount_in_try?: number;
	payment_method: AvailablePaymentMethod;
	description?: string | null;
	invoice_no?: string | null;
	payment_date: Date;
	due_date?: Date | null;
	created_at?: Date;
	updated_at?: Date;
};
