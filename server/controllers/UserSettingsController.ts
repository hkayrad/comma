import express, { Request, Response } from "express";
import { authMiddleware } from "../lib/middleware";
import { Logger } from "../lib/utils/logger";
import { ApiResponse } from "../lib/utils/apiResponse";
import { UserSettingsService } from "../services/UserSettingsService";

const router = express.Router();

router.use(authMiddleware);

// Update username
router.put("/username", async (req: Request, res: Response) => {
    Logger.info("[UserSettingsController] Update username request");

    try {
        const { newUsername, currentPassword } = req.body;
        const userId = req.user.id;

        if (!newUsername || !currentPassword) {
            return res.status(400).json(ApiResponse.error("New username and current password are required"));
        }

        if (newUsername.length < 3 || newUsername.length > 50) {
            return res.status(400).json(ApiResponse.error("Username must be between 3 and 50 characters"));
        }

        const result = await UserSettingsService.UpdateUsername(userId, newUsername, currentPassword);

        if (!result.success) {
            return res.status(400).json(result);
        }

        Logger.info("[UserSettingsController] Username updated successfully", { userId });
        res.json(result);
    } catch (err: unknown) {
    	const error = err instanceof Error ? err : new Error(String(err));
        Logger.error("[UserSettingsController] Error updating username", error);
        res.status(500).json(ApiResponse.error("Failed to update username"));
    }
});

// Update password
router.put("/password", async (req: Request, res: Response) => {
    Logger.info("[UserSettingsController] Update password request");

    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json(ApiResponse.error("Current password and new password are required"));
        }

        if (newPassword.length < 6 || newPassword.length > 100) {
            return res.status(400).json(ApiResponse.error("Password must be between 6 and 100 characters"));
        }

        const result = await UserSettingsService.UpdatePassword(userId, currentPassword, newPassword);

        if (!result.success) {
            return res.status(400).json(result);
        }

        Logger.info("[UserSettingsController] Password updated successfully", { userId });
        res.json(result);
    } catch (err: unknown) {
    	const error = err instanceof Error ? err : new Error(String(err));
        Logger.error("[UserSettingsController] Error updating password", error);
        res.status(500).json(ApiResponse.error("Failed to update password"));
    }
});

export default router;
