import { z } from "zod";

export const companySchema = z.object({
	name: z.string().min(1, "Company name is required").max(255),
	is_company: z.boolean(),
	phone: z.string().max(20).nullish(),
	tax_number: z.string().max(11).nullish(),
	tax_office: z.string().max(255).nullish(),
	mersis_no: z.string().max(16).nullish(),
	email: z.email().max(255).nullish().or(z.literal("")),
	address: z.string().max(500).nullish(),
});
