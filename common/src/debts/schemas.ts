import { z } from "zod";

export const debtSchema = z.object({
	customer_id: z.uuid("Invalid customer ID"),
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
