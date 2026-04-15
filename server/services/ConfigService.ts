import { Logger } from "../lib/utils/logger";
import dotenv from "dotenv";
import { ConfigKey, ConfigValue } from "@common/types";
import { Config } from "../models";

dotenv.config();

export class ConfigService {
	static async GetConfigs(): Promise<{ [key: string]: string }> {
		try {
			Logger.debug("[ConfigService] Fetching all configs");

			const rows = await Config.findAll();

			const configs: { [key: string]: string } = {};

			for (const row of rows) {
				configs[row.configKey] = row.configValue;
			}

			Logger.debug("[ConfigService] Configs fetched successfully", { count: Object.keys(configs).length });
			return configs;
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[ConfigService] Error fetching configs", error);
			return {};
		}
	}

	static async GetConfig(configKey: ConfigKey): Promise<ConfigValue | null> {
		try {
			Logger.debug("[ConfigService] Fetching config", { configKey });

			const config = await Config.findByPk(configKey);

			if (!config) {
				Logger.debug("[ConfigService] Config not found", { configKey });
				return null;
			}

			Logger.debug("[ConfigService] Config fetched successfully", { configKey });
			return config.configValue;
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[ConfigService] Error fetching config", error);
			return null;
		}
	}

	static async SetConfig(configKey: ConfigKey, configValue: ConfigValue): Promise<boolean> {
		try {
			Logger.info("[ConfigService] Setting config", { configKey });

			// upsert handles "INSERT ... ON DUPLICATE KEY UPDATE"
			await Config.upsert({
				configKey: configKey,
				configValue: configValue,
			});

			Logger.info("[ConfigService] Config set successfully", { configKey });
			return true;
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[ConfigService] Error setting config", { configKey, error });
			return false;
		}
	}

	static async StartMaintenanceMode(): Promise<boolean> {
		Logger.info("[ConfigService] Starting maintenance mode");
		const result = await this.SetConfig("maintenanceMode", "active");
		if (result) {
			Logger.info("[ConfigService] Maintenance mode started successfully");
		} else {
			Logger.error("[ConfigService] Failed to start maintenance mode");
		}
		return result;
	}

	static async EndMaintenanceMode(): Promise<boolean> {
		Logger.info("[ConfigService] Ending maintenance mode");
		const result = await this.SetConfig("maintenanceMode", "inactive");
		if (result) {
			Logger.info("[ConfigService] Maintenance mode ended successfully");
		} else {
			Logger.error("[ConfigService] Failed to end maintenance mode");
		}
		return result;
	}
}
