import express, { Request, Response } from "express";
import { authMiddleware } from "../lib/middleware";
import { CompanyService } from "../services/CompanyService";
import { Logger } from "../lib/utils/logger";
import { UploadedFile } from "express-fileupload";
import { CompanyDto } from "@common/types";
import { asyncHandler } from "../lib/utils/middleware/asyncHandler";
import { ValidationError } from "../lib/errors/AppError";

const router = express.Router();

router.use(authMiddleware);

router.put("/", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const details: CompanyDto = req.body;

	Logger.info("[CompanyController] Update company details request", { companyId });

	if (!details || Object.keys(details).length === 0) {
		throw new ValidationError("Company details are required");
	}

	await CompanyService.UpdateCompanyDetails(companyId, details);
	res.json({ success: true, message: "Company details updated successfully" });
}));

router.get("/id", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.debug("[CompanyController] Get company by ID request", { companyId });

	const data = await CompanyService.GetCompanyById(companyId);
	res.json({ success: true, data });
}));

router.post("/logo/small", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.info("[CompanyController] Upload small logo request", { companyId });

	if (!req.files?.logo) {
		throw new ValidationError("Logo file is required");
	}

	const data = await CompanyService.UploadLogo("small", req.files.logo as UploadedFile, companyId);
	res.json({ success: true, data, message: "Logo uploaded successfully" });
}));

router.post("/logo/large", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.info("[CompanyController] Upload large logo request", { companyId });

	if (!req.files?.logo) {
		throw new ValidationError("Logo file is required");
	}

	const data = await CompanyService.UploadLogo("large", req.files.logo as UploadedFile, companyId);
	res.json({ success: true, data, message: "Logo uploaded successfully" });
}));

router.delete("/logo/small", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.info("[CompanyController] Delete small logo request", { companyId });

	await CompanyService.DeleteLogo("small", companyId);
	res.json({ success: true, message: "Logo deleted successfully" });
}));

router.delete("/logo/large", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.info("[CompanyController] Delete large logo request", { companyId });

	await CompanyService.DeleteLogo("large", companyId);
	res.json({ success: true, message: "Logo deleted successfully" });
}));

router.get("/logos", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.debug("[CompanyController] Get logos request", { companyId });

	const data = await CompanyService.GetLogos(companyId);
	res.json({ success: true, data });
}));

export default router;

