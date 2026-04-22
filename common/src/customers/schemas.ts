import { z } from "zod";

export const customerSchema = z.object({
	name: z.string().min(1, "Name is required").max(255),
	phone: z.string().max(20).nullish(),
	is_company: z.boolean(),
	tax_number: z.string().max(11).nullish(),
	tax_office: z.string().max(255).nullish(),
	mersis_no: z.string().max(16).nullish(),
	email: z.email().max(255).nullish().or(z.literal("")),
	address: z.string().max(500).nullish(),
});
