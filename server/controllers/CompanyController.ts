import express, { Request, Response } from "express";
import { authMiddleware } from "../lib/utils/middleware";
import { CompanyService } from "../services/CompanyService";
import { Logger } from "../lib/utils";
import { UploadedFile } from "express-fileupload";
import { CompanyDto } from "@common/types";

const router = express.Router();

router.use(authMiddleware);

router.put("/", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const details: CompanyDto = req.body;

	Logger.info("[CompanyController] Update company details request", { companyId });

	try {
		if (!details || Object.keys(details).length === 0) {
			Logger.warn("[CompanyController] No details provided", { companyId });
			return res.status(400).json({ success: false, message: "Company details are required" });
		}

		const response = await CompanyService.UpdateCompanyDetails(companyId, details);

		Logger.info("[CompanyController] Company details update result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[CompanyController] Error updating company details", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error updating company details" });
	}
});

router.get("/id", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.debug("[CompanyController] Get company by ID request", { companyId });

	try {
		const response = await CompanyService.GetCompanyById(companyId);

		Logger.debug("[CompanyController] Company fetched", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[CompanyController] Error fetching company", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error fetching company" });
	}
});

router.post("/logo/small", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.info("[CompanyController] Upload small logo request", { companyId });

	try {
		if (!req.files?.logo) {
			Logger.warn("[CompanyController] No logo file provided", { companyId });
			return res.status(400).json({ success: false, message: "Logo file is required" });
		}

		const response = await CompanyService.UploadLogo("small", req.files.logo as UploadedFile, companyId);

		Logger.info("[CompanyController] Small logo upload result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[CompanyController] Error uploading small logo", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error uploading logo" });
	}
});

router.post("/logo/large", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.info("[CompanyController] Upload large logo request", { companyId });

	try {
		if (!req.files?.logo) {
			Logger.warn("[CompanyController] No logo file provided", { companyId });
			return res.status(400).json({ success: false, message: "Logo file is required" });
		}

		const response = await CompanyService.UploadLogo("large", req.files.logo as UploadedFile, companyId);

		Logger.info("[CompanyController] Large logo upload result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[CompanyController] Error uploading large logo", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error uploading logo" });
	}
});

router.delete("/logo/small", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.info("[CompanyController] Delete small logo request", { companyId });

	try {
		const response = await CompanyService.DeleteLogo("small", companyId);

		Logger.info("[CompanyController] Small logo deletion result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[CompanyController] Error deleting small logo", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error deleting logo" });
	}
});

router.delete("/logo/large", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.info("[CompanyController] Delete large logo request", { companyId });

	try {
		const response = await CompanyService.DeleteLogo("large", companyId);

		Logger.info("[CompanyController] Large logo deletion result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[CompanyController] Error deleting large logo", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error deleting logo" });
	}
});

router.get("/logos", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.debug("[CompanyController] Get logos request", { companyId });

	try {
		const response = await CompanyService.GetLogos(companyId);

		Logger.debug("[CompanyController] Logos fetched", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[CompanyController] Error fetching logos", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error fetching logos" });
	}
});

export default router;
