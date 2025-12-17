import express, { Request, Response, NextFunction } from "express";
import { ConfigService } from "../services/ConfigService";
import { Logger } from "../lib/utils/logger";
import { configMiddleware } from "../lib/middleware";

interface ConfigKeyValue {
	configKey: string;
	configValue: string;
}

type Configs = Record<string, string>;

const router = express.Router();

router.use(configMiddleware);

router.get("/", async (req: Request, res: Response) => {
	Logger.debug("[ConfigController] Get all configs");
	try {
		const configs: Configs = await ConfigService.GetConfigs();

		if (!configs || Object.keys(configs).length === 0) {
			Logger.debug("[ConfigController] No configs found");
			return res.status(404).json({ success: false, message: "No configs found" });
		}

		Logger.info("[ConfigController] Returning configs", { count: Object.keys(configs).length });
		return res.json({ success: true, configs });
	} catch (error: any) {
		Logger.error("[ConfigController] Error fetching configs", { error: error.message });
		return res.status(500).json({ success: false, message: "Error retrieving configs" });
	}
});

router.get("/:configKey", async (req: Request, res: Response) => {
	const configKey = req.params.configKey;
	Logger.debug("[ConfigController] Get config", { configKey });

	try {
		const configValue = await ConfigService.GetConfig(configKey);

		if (configValue === null || configValue === undefined) {
			Logger.debug("[ConfigController] Config not found", { configKey });
			return res.status(404).json({ success: false, message: "Config not found" });
		}

		Logger.info("[ConfigController] Returning config value", { configKey });
		return res.json({ success: true, configKey, configValue });
	} catch (error: any) {
		Logger.error("[ConfigController] Error fetching config", { configKey, error: error.message });
		return res.status(500).json({ success: false, message: "Error retrieving config" });
	}
});

router.post("/", async (req: Request, res: Response) => {
	Logger.debug("[ConfigController] Set config request", { body: req.body });

	const body = req.body as Partial<ConfigKeyValue>;
	const configKey = body.configKey;
	const configValue = body.configValue;
	const user = req.user;

	if (!user || user.role !== 99) {
		Logger.warn("[ConfigController] Unauthorized user", { user });
		return res.status(403).json({ success: false, message: "Unauthorized" });
	}

	if (!configKey || !configValue) {
		Logger.warn("[ConfigController] Missing configKey or configValue", { body });
		return res.status(400).json({ success: false, message: "configKey and configValue are required" });
	}

	try {
		const result = await ConfigService.SetConfig(configKey, configValue);

		if (!result) {
			Logger.error("[ConfigController] Failed to set config", { configKey });
			return res.status(500).json({ success: false, message: "Failed to set config" });
		}

		Logger.info("[ConfigController] Config set successfully", { configKey });
		return res.json({ success: true, message: "Config set successfully" });
	} catch (error: any) {
		Logger.error("[ConfigController] Error setting config", { configKey, error: error.message });
		return res.status(500).json({ success: false, message: "Error setting config" });
	}
});

router.post("/start-maintenance", async (req: Request, res: Response) => {
	const user = req.user;

	if (!user || user.role !== 99) {
		Logger.warn("[ConfigController] Unauthorized user", { user });
		return res.status(403).json({ success: false, message: "Unauthorized" });
	}

	Logger.debug("[ConfigController] Start maintenance request");
	try {
		const result = await ConfigService.StartMaintenanceMode();

		if (!result) {
			Logger.error("[ConfigController] Failed to start maintenance mode");
			return res.status(500).json({ success: false, message: "Failed to start maintenance mode" });
		}

		Logger.info("[ConfigController] Maintenance mode started");
		return res.json({ success: true, message: "Maintenance mode started successfully" });
	} catch (error: any) {
		Logger.error("[ConfigController] Error starting maintenance mode", { error: error.message });
		return res.status(500).json({ success: false, message: "Error starting maintenance mode" });
	}
});

router.post("/end-maintenance", async (req: Request, res: Response) => {
	const user = req.user;

	if (!user || user.role !== 99) {
		Logger.warn("[ConfigController] Unauthorized user", { user });
		return res.status(403).json({ success: false, message: "Unauthorized" });
	}

	Logger.debug("[ConfigController] End maintenance request");
	try {
		const result = await ConfigService.EndMaintenanceMode();

		if (!result) {
			Logger.error("[ConfigController] Failed to end maintenance mode");
			return res.status(500).json({ success: false, message: "Failed to end maintenance mode" });
		}

		Logger.info("[ConfigController] Maintenance mode ended");
		return res.json({ success: true, message: "Maintenance mode ended successfully" });
	} catch (error: any) {
		Logger.error("[ConfigController] Error ending maintenance mode", { error: error.message });
		return res.status(500).json({ success: false, message: "Error ending maintenance mode" });
	}
});

export default router;
