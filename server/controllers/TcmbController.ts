import express from "express";
import { Logger } from "../lib/utils/logger";
import { authMiddleware } from "../lib/middleware";
import { TcmbService } from "../services/TcmbService";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
	try {
		Logger.debug("[TCMB] Fetching exchange rates");

		const data = await TcmbService.GetExchangeRates();

		if (!data) {
			return res.status(500).json({ success: false, message: "Error fetching TCMB data" });
		}

		res.send(data);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[TCMB] Error in controller", { error: error.message });
		res.status(500).json({ success: false, message: "Error fetching TCMB data" });
	}
});

export default router;
