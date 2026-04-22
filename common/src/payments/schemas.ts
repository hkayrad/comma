import { z } from "zod";

export const paymentSchema = z.object({
	customer_id: z.uuid("Invalid customer ID"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.enum(["TRY", "USD", "EUR"]),
	exchange_rate: z.number().positive("Exchange rate must be positive"),
	payment_method: z.enum(["cash", "bank_transfer", "check", "card"]),
	description: z.string().max(500).nullish(),
	invoice_no: z.string().max(100).nullish(),
	payment_date: z.coerce.date(),
	due_date: z.coerce.date().nullish(),
});
