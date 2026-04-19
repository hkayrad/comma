import express from "express";
import { Logger } from "../lib/utils/logger";
import { authMiddleware } from "../lib/middleware";
import { TcmbService } from "../services/TcmbService";
import { asyncHandler } from "../lib/utils/middleware/asyncHandler";
import { AppError } from "../lib/errors/AppError";

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(async (req, res) => {
	Logger.debug("[TCMB] Fetching exchange rates");
	const data = await TcmbService.GetExchangeRates();
	if (!data) throw new AppError("Error fetching TCMB data", 500);
	res.send(data);
}));

export default router;

