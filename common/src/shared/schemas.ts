import { z } from "zod";

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
