import instance from "../instance";
import { Logger } from "../utils/logger";

export class UserApi {
    static async UpdateUsername(newUsername: string, currentPassword: string) {
        try {
            const response = await instance.put("/settings/username", {
                newUsername,
                currentPassword,
            });
            return response.data;
        } catch (error) {
            Logger.error("Error updating username:", error);
            throw error;
        }
    }

    static async UpdatePassword(currentPassword: string, newPassword: string) {
        try {
            const response = await instance.put("/settings/password", {
                currentPassword,
                newPassword,
            });
            return response.data;
        } catch (error) {
            Logger.error("Error updating password:", error);
            throw error;
        }
    }
}
