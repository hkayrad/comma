import instance from "../instance";
import { Logger } from "@/lib/utils/logger";

export class AuthApi {
	static async Login(username: string, password: string) {
		try {
			const response = await instance.post("/login", { username, password });

			Logger.info("Login response", response);

			if (response.status !== 200) {
				Logger.error("Login failed");
				return Promise.reject(new Error("Login failed"));
			}

			return Promise.resolve(response);
		} catch (error) {
			Logger.error(error);
			return Promise.reject(new Error("Login failed"));
		}
	}

	static async Logout() {
		try {
			const response = await instance.post("/logout");

			if (response.status !== 200) {
				Logger.error("Logout failed");
				return Promise.reject(new Error("Logout failed"));
			}

			return Promise.resolve(true);
		} catch (error) {
			Logger.error(error);
			return Promise.reject(new Error("Logout failed"));
		}
	}

	static async Refresh() {
		try {
			const response = await instance.post("/refresh");

			if (response.status !== 200) {
				Logger.error("Refresh token failed");
				return Promise.reject(new Error("Refresh token failed"));
			}

			return Promise.resolve(response);
		} catch (error) {
			Logger.error(error);
			return Promise.reject(new Error("Refresh token failed"));
		}
	}
}
