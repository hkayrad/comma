import { Config } from "../models";
import { ConfigKey, ConfigValue } from "@common/types";

export class ConfigRepository {
	static async findAll(): Promise<{ configKey: string; configValue: string }[]> {
		return await Config.findAll();
	}

	static async findByKey(configKey: ConfigKey): Promise<{ configKey: string; configValue: string } | null> {
		return await Config.findByPk(configKey);
	}

	static async upsert(configKey: ConfigKey, configValue: ConfigValue): Promise<void> {
		await Config.upsert({
			configKey: configKey,
			configValue: configValue,
		});
	}
}
