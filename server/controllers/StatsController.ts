import express, { Request, Response } from "express";
import { authMiddleware } from "../lib/middleware";
import { Logger } from "../lib/utils/logger";
import StatsService from "../services/StatsService";
import { asyncHandler } from "../lib/utils/middleware/asyncHandler";

const router = express.Router();

router.use(authMiddleware);

router.get("/monthly", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
	const monthCount = req.query.months ? parseInt(req.query.months as string) : 12;

	Logger.debug("[StatsController] Get monthly stats request", { companyId, startDate, monthCount });

	const data = await StatsService.GetMonthlyStats(companyId, startDate, monthCount);
	res.json({ success: true, data });
}));

export default router;

