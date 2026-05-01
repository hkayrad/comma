import { z } from "zod";

export const portalLoginSchema = z.object({
	companyId: z.string().uuid(),
	tax_number: z.string().min(5).max(11).regex(/^[0-9]+$/),
});
