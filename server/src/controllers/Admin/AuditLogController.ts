import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { AuditLogService } from "@/services/AuditLogService";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { paginationSchema } from "@comma/common/schemas";

const router = express.Router();

router.use(authMiddleware);

router.get("/audit-logs", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
	const filterCompanyId = (req.query.companyId as string) || (req.query.company_id as string) || undefined;
	const companyId = filterCompanyId || (req.user.role === 1 ? "ALL" : req.user.companyId);
	const { page, limit, sorting, filters } = req.query as any;
	Logger.info("[AuditLogController] Get audit logs request", { companyId, page, limit });

	const result = await AuditLogService.getLogs(companyId, page, limit, sorting, filters);
	res.json({ success: true, data: result });
}));

export default router;
