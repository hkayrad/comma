import express, { Request, Response } from "express";
import { authMiddleware } from "../lib/middleware";
import { Logger } from "../lib/utils/logger";
import StatsService from "../services/StatsService";

const router = express.Router();

router.use(authMiddleware);

router.get("/monthly", async (req: Request, res: Response) => {
    const companyId = req.user.companyId;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const monthCount = req.query.months ? parseInt(req.query.months as string) : 12;

    Logger.debug("[StatsController] Get monthly stats request", { companyId, startDate, monthCount });

    try {
        const response = await StatsService.GetMonthlyStats(companyId, startDate, monthCount);

        Logger.debug("[StatsController] Get monthly stats result", { companyId, success: response.success });
        return res.json(response);
    } catch (err: unknown) {
    	const error = err instanceof Error ? err : new Error(String(err));
        Logger.error("[StatsController] Error fetching monthly stats", { companyId, error: error.message });
        return res.status(500).json({ success: false, message: "Error fetching monthly stats" });
    }
});

export default router;
