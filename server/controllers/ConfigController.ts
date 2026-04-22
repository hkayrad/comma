import express, { Request, Response } from "express";
import { ConfigService } from "../services/ConfigService";
import { Logger } from "../lib/utils/logger";
import { configMiddleware } from "../lib/middleware";
import { asyncHandler } from "../lib/utils/middleware/asyncHandler";
import { ValidationError, ForbiddenError } from "../lib/errors/AppError";
import { validate } from "../lib/utils/middleware/validate";
import { configSchema } from "@common/schemas";
import { UserRole } from "@common/enums";

interface ConfigKeyValue {
	configKey: string;
	configValue: string;
}

const router = express.Router();

router.use(configMiddleware);

router.get("/", asyncHandler(async (req: Request, res: Response) => {
	Logger.debug("[ConfigController] Get all configs");
	const configs = await ConfigService.GetConfigs();

	if (!configs || Object.keys(configs).length === 0) {
		Logger.debug("[ConfigController] No configs found");
		res.status(404).json({ success: false, message: "No configs found" });
		return;
	}

	Logger.info("[ConfigController] Returning configs", { count: Object.keys(configs).length });
	res.json({ success: true, configs });
}));

router.get("/:configKey", asyncHandler(async (req: Request, res: Response) => {
	const configKey = req.params.configKey;
	Logger.debug("[ConfigController] Get config", { configKey });

	const configValue = await ConfigService.GetConfig(configKey);

	if (configValue === null || configValue === undefined) {
		Logger.debug("[ConfigController] Config not found", { configKey });
		res.status(404).json({ success: false, message: "Config not found" });
		return;
	}

	Logger.info("[ConfigController] Returning config value", { configKey });
	res.json({ success: true, configKey, configValue });
}));

router.post("/", validate(configSchema), asyncHandler(async (req: Request, res: Response) => {
	Logger.debug("[ConfigController] Set config request", { body: req.body });

	const body = req.body as ConfigKeyValue;
	const { configKey, configValue } = body;
	const user = req.user;

	if (!user || user.role !== UserRole.ADMIN) {
		throw new ForbiddenError("Unauthorized");
	}

	await ConfigService.SetConfig(configKey, configValue);
	Logger.info("[ConfigController] Config set successfully", { configKey });
	res.json({ success: true, message: "Config set successfully" });
}));

router.post("/start-maintenance", asyncHandler(async (req: Request, res: Response) => {
	const user = req.user;
	if (!user || user.role !== UserRole.ADMIN) throw new ForbiddenError("Unauthorized");

	Logger.debug("[ConfigController] Start maintenance request");
	await ConfigService.StartMaintenanceMode();
	Logger.info("[ConfigController] Maintenance mode started");
	res.json({ success: true, message: "Maintenance mode started successfully" });
}));

router.post("/end-maintenance", asyncHandler(async (req: Request, res: Response) => {
	const user = req.user;
	if (!user || user.role !== UserRole.ADMIN) throw new ForbiddenError("Unauthorized");

	Logger.debug("[ConfigController] End maintenance request");
	await ConfigService.EndMaintenanceMode();
	Logger.info("[ConfigController] Maintenance mode ended");
	res.json({ success: true, message: "Maintenance mode ended successfully" });
}));

export default router;

