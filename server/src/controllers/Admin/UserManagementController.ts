import express, { Request, Response } from "express";
import { adminMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { UserManagementService } from "@/services/Admin/UserManagementService";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { ValidationError } from "@/lib/errors/AppError";
import { validate } from "@/lib/utils/middleware/validate";
import { createUserSchema, paginationSchema } from "@comma/common/schemas";
import { authRateLimiter } from "@/lib/utils/middleware/rateLimiter";

const router = express.Router();

router.use(adminMiddleware);

// Create a new user
router.post("/", authRateLimiter, validate(createUserSchema), asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Create user");
	const id = await UserManagementService.Create(req.body, req.user.id);
	res.json({ success: true, data: id, message: "User created successfully" });
}));

// Get all users for a company (with pagination, sorting, filtering)
router.get("/company/:companyId", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
	const { companyId } = req.params;
	const { page, limit, sorting, filters } = req.query as any;
	Logger.info("[UserManagementController] Get users by company", { companyId, page, limit });

	const data = await UserManagementService.GetAllByCompany(companyId, page, limit, sorting, filters);
	res.json({ success: true, data });
}));

// Get user by ID
router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Get user by id");
	const data = await UserManagementService.GetById(req.params.id);
	res.json({ success: true, data });
}));

// Update user
router.put("/:id", authRateLimiter, asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Update user");
	const data = await UserManagementService.Update(req.params.id, req.body, req.user.id);
	res.json({ success: true, data, message: "User updated successfully" });
}));

// Delete user
router.delete("/:id", authRateLimiter, asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Delete user");
	await UserManagementService.Delete(req.params.id, req.user.id);
	res.json({ success: true, message: "User deleted successfully" });
}));

// Restore user
router.post("/:id/restore", authRateLimiter, asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Restore user");
	await UserManagementService.Restore(req.params.id);
	res.json({ success: true, message: "User restored successfully" });
}));

// Reset user password
router.post("/:id/reset-password", authRateLimiter, asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Reset user password");
	const { password } = req.body;
	if (!password) throw new ValidationError("Password is required");

	await UserManagementService.ResetPassword(req.params.id, password);
	res.json({ success: true, message: "Password reset successfully" });
}));

export default router;
