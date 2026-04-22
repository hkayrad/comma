import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { UserSettingsService } from "@/services/UserSettingsService";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { updateUsernameSchema, updatePasswordSchema } from "@common/schemas";

const router = express.Router();

router.use(authMiddleware);

// Update username
router.put("/username", validate(updateUsernameSchema), asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[UserSettingsController] Update username request");

	const { newUsername, currentPassword } = req.body;
	const userId = req.user.id;

	await UserSettingsService.UpdateUsername(userId, newUsername, currentPassword);
	Logger.info("[UserSettingsController] Username updated successfully", { userId });
	res.json({ success: true, message: "Username updated successfully" });
}));

// Update password
router.put("/password", validate(updatePasswordSchema), asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[UserSettingsController] Update password request");

	const { currentPassword, newPassword } = req.body;
	const userId = req.user.id;

	await UserSettingsService.UpdatePassword(userId, currentPassword, newPassword);
	Logger.info("[UserSettingsController] Password updated successfully", { userId });
	res.json({ success: true, message: "Password updated successfully" });
}));

export default router;

