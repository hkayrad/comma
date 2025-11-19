import instance from "../instance";
import { Logger } from "../utils/logger";

export class ConfigApi {
	static async GetConfigs() {
		try {
			const response = await instance.get("/configs");
			return response.data;
		} catch (error) {
			Logger.error("Error fetching configs:", error);
			throw error;
		}
	}

	static async GetConfig(configKey: string) {
		try {
			const response = await instance.get(`/configs/${configKey}`);
			return response.data;
		} catch (error) {
			Logger.error(`Error fetching config ${configKey}:`, error);
			throw error;
		}
	}

	static async SetConfig(configKey: string, configValue: string) {
		try {
			const response = await instance.post("/configs", { configKey, configValue });
			return response.data;
		} catch (error) {
			Logger.error(`Error setting config ${configKey}:`, error);
			throw error;
		}
	}

	static async StartMaintenanceMode() {
		try {
			const response = await instance.post("/configs/start-maintenance");
			return response.data;
		} catch (error) {
			Logger.error("Error starting maintenance mode:", error);
			throw error;
		}
	}

	static async EndMaintenanceMode() {
		try {
			const response = await instance.post("/configs/end-maintenance");
			return response.data;
		} catch (error) {
			Logger.error("Error ending maintenance mode:", error);
			throw error;
		}
	}
}
