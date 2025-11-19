import express from "express";
import { adminMiddleware } from "../../lib/middleware";
import { ApiResponse, Logger } from "../../lib/utils";
import { CompanyManagementService } from "../../services/Admin/CompanyManagementService";

const router = express.Router();

router.use(adminMiddleware);

router.post("/", async (req, res) => {
	Logger.info("[CompanyManagementController] Create company");

	try {
		const result = await CompanyManagementService.Create(req.body);

		Logger.info("[CompanyManagementController] Create company result", { result });
		res.json(result);
	} catch (error: any) {
		Logger.error("[CompanyManagementController] Error creating company", error);
		res.status(500).json(ApiResponse.error("Failed to create company"));
	}
});

router.get("/", async (req, res) => {
	Logger.info("[CompanyManagementController] Get companies");

	try {
		const response = await CompanyManagementService.GetAll();
		res.status(200).json(response);
	} catch (error) {
		Logger.error("[CompanyManagementController] Error getting companies", error);
		res.status(500).json({ error: "Internal Server Error" });
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

export default router;
