import express, { Request, Response } from "express";
import { adminMiddleware } from "../../lib/middleware";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { UserManagementService } from "../../services/Admin/UserManagementService";

const router = express.Router();

router.use(adminMiddleware);

// Create a new user
router.post("/", async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Create user");

	try {
		const result = await UserManagementService.Create(req.body, req.user.id);

		Logger.info("[UserManagementController] Create user result", { result });
		res.json(result);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[UserManagementController] Error creating user", error);
		res.status(500).json(ApiResponse.error("Failed to create user"));
	}
});

// Get all users for a company (with pagination, sorting, filtering)
router.get("/company/:companyId", async (req: Request, res: Response) => {
	const { companyId } = req.params;
	const page = parseInt(req.query.page as string) || 0;
	const limit = parseInt(req.query.limit as string) || 20;
	const sorting = req.query.sorting ? JSON.parse(req.query.sorting as string) : [];
	const filters = req.query.filters ? JSON.parse(req.query.filters as string) : [];

	Logger.info("[UserManagementController] Get users by company", { companyId, page, limit, sorting, filters });

	try {
		const response = await UserManagementService.GetAllByCompany(companyId, page, limit, sorting, filters);

		Logger.debug("[UserManagementController] Get users result", { companyId, success: response.success });
		return res.json(response);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[UserManagementController] Error getting users", error);
		res.status(500).json(ApiResponse.error("Failed to fetch users"));
	}
});

// Get user by ID
router.get("/:id", async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Get user by id");

	try {
		const response = await UserManagementService.GetById(req.params.id);
		res.json(response);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[UserManagementController] Error getting user by id", error);
		res.status(500).json(ApiResponse.error("Failed to fetch user"));
	}
});

// Update user
router.put("/:id", async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Update user");

	try {
		const result = await UserManagementService.Update(req.params.id, req.body, req.user.id);

		Logger.info("[UserManagementController] Update user result", { result });
		res.json(result);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[UserManagementController] Error updating user", error);
		res.status(500).json(ApiResponse.error("Failed to update user"));
	}
});

// Delete user
router.delete("/:id", async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Delete user");

	try {
		const result = await UserManagementService.Delete(req.params.id, req.user.id);

		Logger.info("[UserManagementController] Delete user result", { result });
		res.json(result);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[UserManagementController] Error deleting user", error);
		res.status(500).json(ApiResponse.error("Failed to delete user"));
	}
});

// Reset user password
router.post("/:id/reset-password", async (req: Request, res: Response) => {
	Logger.info("[UserManagementController] Reset user password");

	try {
		const { password } = req.body;

		if (!password) {
			return res.status(400).json(ApiResponse.error("Password is required"));
		}

		const result = await UserManagementService.ResetPassword(req.params.id, password);

		Logger.info("[UserManagementController] Reset password result", { result });
		res.json(result);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[UserManagementController] Error resetting password", error);
		res.status(500).json(ApiResponse.error("Failed to reset password"));
	}
});

export default router;