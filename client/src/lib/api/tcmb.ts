import instance from "../instance";
import { Logger } from "../utils/logger";

export class TCMBApi {
	static async GetExchangeRates() {
		try {
			const response = await instance.get("/tcmb");

			if (response.status !== 200) {
				Logger.error("Failed to fetch exchange rates");
				return null;
			}

			return response.data;
		} catch (error) {
			Logger.error("Error fetching exchange rates:", error);
			throw error;
		}
	}
}
