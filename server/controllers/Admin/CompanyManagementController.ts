import express, { Request, Response } from "express";
import { adminMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { CompanyManagementService } from "@/services/Admin/CompanyManagementService";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { companySchema, paginationSchema } from "@comma/common/schemas";

const router = express.Router();

router.use(adminMiddleware);

router.post("/", validate(companySchema), asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[CompanyManagementController] Create company");
	const id = await CompanyManagementService.Create(req.body);
	res.json({ success: true, data: id, message: "Company created successfully" });
}));

router.get("/", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
	const { page, limit, sorting, filters } = req.query as any;
	Logger.info("[CompanyManagementController] Get companies", { page, limit });

	const data = await CompanyManagementService.GetAll(page, limit, sorting, filters);
	res.json({ success: true, data });
}));

router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[CompanyManagementController] Get company by id");
	const data = await CompanyManagementService.GetById(req.params.id);
	res.json({ success: true, data });
}));

router.put("/:id", validate(companySchema), asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[CompanyManagementController] Update company");
	const data = await CompanyManagementService.Update(req.params.id, req.body);
	res.json({ success: true, data, message: "Company updated successfully" });
}));

router.delete("/:id", asyncHandler(async (req: Request, res: Response) => {
	Logger.info("[CompanyManagementController] Delete company");
	await CompanyManagementService.Delete(req.params.id);
	res.json({ success: true, message: "Company deleted successfully" });
}));

export default router;
