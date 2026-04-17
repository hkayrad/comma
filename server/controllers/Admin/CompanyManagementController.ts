import express, { Request, Response } from "express";
import { adminMiddleware } from "../../lib/middleware";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { CompanyManagementService } from "../../services/Admin/CompanyManagementService";

const router = express.Router();

router.use(adminMiddleware);

router.post("/", async (req, res) => {
	Logger.info("[CompanyManagementController] Create company");

	try {
		const result = await CompanyManagementService.Create(req.body);

		Logger.info("[CompanyManagementController] Create company result", { result });
		res.json(result);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[CompanyManagementController] Error creating company", error);
		res.status(500).json(ApiResponse.error("Failed to create company"));
	}
});

router.get("/", async (req: Request, res: Response) => {
	const page = parseInt(req.query.page as string) || 0;
	const limit = parseInt(req.query.limit as string) || 20;
	const sorting = req.query.sorting ? JSON.parse(req.query.sorting as string) : [];
	const filters = req.query.filters ? JSON.parse(req.query.filters as string) : [];

	Logger.info("[CompanyManagementController] Get companies", { page, limit, sorting, filters });

	try {
		const response = await CompanyManagementService.GetAll(page, limit, sorting, filters);

		Logger.debug("[CompanyManagementController] Get companies result", { success: response.success });
		return res.json(response);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[CompanyManagementController] Error getting companies", error);
		res.status(500).json(ApiResponse.error("Failed to fetch companies"));
	}
});

router.get("/:id", async (req, res) => {
	Logger.info("[CompanyManagementController] Get company by id");

	try {
		const response = await CompanyManagementService.GetById(req.params.id);
		res.status(200).json(response);
	} catch (error) {
		Logger.error("[CompanyManagementController] Error getting company by id", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

router.put("/:id", async (req, res) => {
	Logger.info("[CompanyManagementController] Update company");

	try {
		const result = await CompanyManagementService.Update(req.params.id, req.body);

		Logger.info("[CompanyManagementController] Update company result", { result });
		res.json(result);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[CompanyManagementController] Error updating company", error);
		res.status(500).json(ApiResponse.error("Failed to update company"));
	}
});

router.delete("/:id", async (req, res) => {
	Logger.info("[CompanyManagementController] Delete company");

	try {
		const result = await CompanyManagementService.Delete(req.params.id);

		Logger.info("[CompanyManagementController] Delete company result", { result });
		res.json(result);
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		Logger.error("[CompanyManagementController] Error deleting company", error);
		res.status(500).json(ApiResponse.error("Failed to delete company"));
	}
});

export default router;