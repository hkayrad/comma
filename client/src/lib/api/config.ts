import instance from "../instance";
import { Logger } from "../utils/logger";

export class ConfigApi {
	static async GetConfigs() {
		try {
			const response = await instance.get("/config");
			return response.data;
		} catch (error) {
			Logger.error("Error fetching configs:", error);
			throw error;
		}
	}

	static async GetConfig(configKey: string) {
		try {
			const response = await instance.get(`/config/${configKey}`);
			return response.data;
		} catch (error) {
			Logger.error(`Error fetching config ${configKey}:`, error);
			throw error;
		}
	}

	static async SetConfig(configKey: string, configValue: string) {
		try {
			const response = await instance.post("/config", { configKey, configValue });
			return response.data;
		} catch (error) {
			Logger.error(`Error setting config ${configKey}:`, error);
			throw error;
		}
	}

	static async StartMaintenanceMode() {
		try {
			const response = await instance.post("/config/start-maintenance");
			return response.data;
		} catch (error) {
			Logger.error("Error starting maintenance mode:", error);
			throw error;
		}
	}

	static async EndMaintenanceMode() {
		try {
			const response = await instance.post("/config/end-maintenance");
			return response.data;
		} catch (error) {
			Logger.error("Error ending maintenance mode:", error);
			throw error;
		}
	}
}
