import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { CompanyService } from "@/services/CompanyService";
import { Logger } from "@/lib/utils/logger";
import { UploadedFile } from "express-fileupload";
import { CompanyDto } from "@comma/common/types";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { ValidationError, UnauthorizedError } from "@/lib/errors/AppError";

const router = express.Router();

router.use(authMiddleware);

router.put("/", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const userRole = req.user.role;

	if (userRole < 1) {
		throw new UnauthorizedError("You do not have permission to update company details");
	}

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

router.post("/logo/:size", asyncHandler(async (req: Request<{ size: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const userRole = req.user.role;
	const size = req.params.size;

	if (userRole < 1) {
		throw new UnauthorizedError("You do not have permission to upload logos");
	}
	if (size !== "small" && size !== "large") {
		throw new ValidationError("Invalid logo size. Must be 'small' or 'large'");
	}
	if (!req.files?.logo) {
		throw new ValidationError("Logo file is required");
	}

	Logger.info(`[CompanyController] Upload ${size} logo request`, { companyId });
	const data = await CompanyService.UploadLogo(size, req.files.logo as UploadedFile, companyId);
	res.json({ success: true, data, message: "Logo uploaded successfully" });
}));

router.delete("/logo/:size", asyncHandler(async (req: Request<{ size: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const userRole = req.user.role;
	const size = req.params.size;

	if (userRole < 1) {
		throw new UnauthorizedError("You do not have permission to delete logos");
	}
	if (size !== "small" && size !== "large") {
		throw new ValidationError("Invalid logo size. Must be 'small' or 'large'");
	}

	Logger.info(`[CompanyController] Delete ${size} logo request`, { companyId });
	await CompanyService.DeleteLogo(size, companyId);
	res.json({ success: true, message: "Logo deleted successfully" });
}));

router.get("/logos", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.debug("[CompanyController] Get logos request", { companyId });

	const data = await CompanyService.GetLogos(companyId);
	res.json({ success: true, data });
}));

export default router;

