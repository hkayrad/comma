import { pool } from "../lib/db/pool";
import { Logger } from "../lib/utils/logger";
import dotenv from "dotenv";
import { ConfigDto, ConfigKey, ConfigValue } from "@common/types";

dotenv.config();

export class ConfigService {
	static async GetConfigs(): Promise<{ [key: string]: string }> {
		let conn;

		try {
			Logger.debug("[ConfigService] Fetching all configs");
			conn = await pool.getConnection();
			const rows = (await conn.query("SELECT `configKey`, `configValue` FROM config")) as ConfigDto[];

			const configs: { [key: string]: string } = {};

			for (const row of rows) {
				configs[row.configKey] = row.configValue;
			}

			Logger.debug("[ConfigService] Configs fetched successfully", { count: Object.keys(configs).length });
			return configs;
		} catch (error) {
			Logger.error("[ConfigService] Error fetching configs", error);
			return {};
		} finally {
			if (conn) conn.release();
		}
	}

	static async GetConfig(configKey: ConfigKey): Promise<ConfigValue | null> {
		let conn;

		try {
			Logger.debug("[ConfigService] Fetching config", { configKey });
			conn = await pool.getConnection();
			const rows = (await conn.query("SELECT configValue FROM config WHERE `configKey` = ?", [
				configKey,
			])) as ConfigDto[];

			if (rows.length === 0) {
				Logger.debug("[ConfigService] Config not found", { configKey });
				return null;
			}

			Logger.debug("[ConfigService] Config fetched successfully", { configKey });
			return rows[0].configValue;
		} catch (error) {
			Logger.error("[ConfigService] Error fetching config", error);
			return null;
		} finally {
			if (conn) conn.release();
		}
	}

	static async SetConfig(configKey: ConfigKey, configValue: ConfigValue): Promise<boolean> {
		let conn;

		try {
			Logger.info("[ConfigService] Setting config", { configKey });
			conn = await pool.getConnection();
			await conn.query(
				"INSERT INTO config (`configKey`, `configValue`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `configValue` = ?",
				[configKey, configValue, configValue],
			);
			Logger.info("[ConfigService] Config set successfully", { configKey });
			return true;
		} catch (error) {
			Logger.error("[ConfigService] Error setting config", { configKey, error });
			return false;
		} finally {
			if (conn) conn.release();
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
