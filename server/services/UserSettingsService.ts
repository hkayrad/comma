import { Logger } from "../lib/utils/logger";
import { ApiResponse } from "../lib/utils/apiResponse";
import { Users } from "../models";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class UserSettingsService {
    /**
     * Update the username for a user after verifying their current password
     */
    static async UpdateUsername(userId: string, newUsername: string, currentPassword: string) {
        try {
            Logger.info("[UserSettingsService] Updating username", { userId });

            // Find the user
            const user = await Users.findByPk(userId);
            if (!user) {
                Logger.error("[UserSettingsService] User not found", { userId });
                return ApiResponse.error("User not found");
            }

            // Verify current password
            const passwordMatch = await bcrypt.compare(currentPassword, user.pass_hash);
            if (!passwordMatch) {
                Logger.warn("[UserSettingsService] Invalid current password", { userId });
                return ApiResponse.error("Current password is incorrect");
            }

            // Check if username is already taken
            const existingUser = await Users.findOne({ where: { username: newUsername } });
            if (existingUser && existingUser.id !== userId) {
                Logger.warn("[UserSettingsService] Username already taken", { newUsername });
                return ApiResponse.error("Username is already taken");
            }

            // Update the username
            await user.update({ username: newUsername });

            Logger.info("[UserSettingsService] Username updated successfully", { userId, newUsername });
            return ApiResponse.success({ username: newUsername }, "Username updated successfully");
        } catch (err: unknown) {
        	const error = err instanceof Error ? err : new Error(String(err));
            Logger.error("[UserSettingsService] Error updating username", { userId, error: error.message });
            return ApiResponse.error("Failed to update username");
        }
    }

    /**
     * Update the password for a user after verifying their current password
     */
    static async UpdatePassword(userId: string, currentPassword: string, newPassword: string) {
        try {
            Logger.info("[UserSettingsService] Updating password", { userId });

            // Find the user
            const user = await Users.findByPk(userId);
            if (!user) {
                Logger.error("[UserSettingsService] User not found", { userId });
                return ApiResponse.error("User not found");
            }

            // Verify current password
            const passwordMatch = await bcrypt.compare(currentPassword, user.pass_hash);
            if (!passwordMatch) {
                Logger.warn("[UserSettingsService] Invalid current password", { userId });
                return ApiResponse.error("Current password is incorrect");
            }

            // Hash the new password
            const newPassHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

            // Update the password
            await user.update({ pass_hash: newPassHash });

            Logger.info("[UserSettingsService] Password updated successfully", { userId });
            return ApiResponse.success(null, "Password updated successfully");
        } catch (err: unknown) {
        	const error = err instanceof Error ? err : new Error(String(err));
            Logger.error("[UserSettingsService] Error updating password", { userId, error: error.message });
            return ApiResponse.error("Failed to update password");
        }
    }
}
