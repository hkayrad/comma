import { Logger } from "../lib/utils/logger";
import { UserRepository } from "../repositories/UserRepository";
import { NotFoundError, ValidationError, UnauthorizedError } from "../lib/errors/AppError";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class UserSettingsService {
    /**
     * Update the username for a user after verifying their current password
     */
    static async UpdateUsername(userId: string, newUsername: string, currentPassword: string) {
        Logger.info("[UserSettingsService] Updating username", { userId });

        const user = await UserRepository.findById(userId);
        if (!user) throw new NotFoundError("User not found");

        const passwordMatch = await bcrypt.compare(currentPassword, user.pass_hash);
        if (!passwordMatch) throw new UnauthorizedError("Current password is incorrect");

        const existingUser = await UserRepository.findByUsername(newUsername);
        if (existingUser && existingUser.id !== userId) {
            throw new ValidationError("Username is already taken");
        }

        await UserRepository.update(userId, { username: newUsername });
        Logger.info("[UserSettingsService] Username updated successfully", { userId, newUsername });
    }

    /**
     * Update the password for a user after verifying their current password
     */
    static async UpdatePassword(userId: string, currentPassword: string, newPassword: string) {
        Logger.info("[UserSettingsService] Updating password", { userId });

        const user = await UserRepository.findById(userId);
        if (!user) throw new NotFoundError("User not found");

        const passwordMatch = await bcrypt.compare(currentPassword, user.pass_hash);
        if (!passwordMatch) throw new UnauthorizedError("Current password is incorrect");

        const newPassHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await UserRepository.update(userId, { pass_hash: newPassHash });
        Logger.info("[UserSettingsService] Password updated successfully", { userId });
    }
}
