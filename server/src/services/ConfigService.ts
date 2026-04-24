import { Logger } from "@/lib/utils/logger";
import type { ConfigKey, ConfigValue } from "@comma/common/types";
import { ConfigRepository } from "@/repositories/ConfigRepository";

export class ConfigService {
	static async GetConfigs(): Promise<{ [key: string]: string }> {
		Logger.debug("[ConfigService] Fetching all configs");
		const rows = await ConfigRepository.findAll();
		const configs: { [key: string]: string } = {};
		for (const row of rows) {
			configs[row.configKey] = row.configValue;
		}
		Logger.debug("[ConfigService] Configs fetched successfully", { count: Object.keys(configs).length });
		return configs;
	}

	static async GetConfig(configKey: ConfigKey): Promise<ConfigValue | null> {
		Logger.debug("[ConfigService] Fetching config", { configKey });
		const config = await ConfigRepository.findByKey(configKey);
		if (!config) {
			Logger.debug("[ConfigService] Config not found", { configKey });
			return null;
		}
		Logger.debug("[ConfigService] Config fetched successfully", { configKey });
		return config.configValue;
	}

	static async SetConfig(configKey: ConfigKey, configValue: ConfigValue): Promise<void> {
		Logger.info("[ConfigService] Setting config", { configKey });
		await ConfigRepository.upsert(configKey, configValue);
		Logger.info("[ConfigService] Config set successfully", { configKey });
	}

	static async StartMaintenanceMode(): Promise<void> {
		Logger.info("[ConfigService] Starting maintenance mode");
		await this.SetConfig("maintenanceMode", "active");
		Logger.info("[ConfigService] Maintenance mode started successfully");
	}

	static async EndMaintenanceMode(): Promise<void> {
		Logger.info("[ConfigService] Ending maintenance mode");
		await this.SetConfig("maintenanceMode", "inactive");
		Logger.info("[ConfigService] Maintenance mode ended successfully");
	}
}
