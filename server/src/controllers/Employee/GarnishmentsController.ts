import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { garnishmentSchema } from "@comma/common/schemas";
import { EmployeeGarnishments, Employees } from "@/models";

const router = express.Router();
router.use(authMiddleware);

// Get all garnishments
router.get("/garnishments", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.debug("[GarnishmentsController] Get garnishments", { companyId });

	const garnishments = await EmployeeGarnishments.findAll({
		where: { company_id: companyId },
		include: [{ model: Employees, as: "employee", attributes: ["first_name", "last_name"] }],
		order: [["created_at", "DESC"]],
	});

	const formatted = garnishments.map((gar) => {
		const raw = gar.toJSON() as any;
		const totalDebt = Number(raw.total_debt) || 0;
		const paidAmount = Number(raw.paid_amount) || 0;
		return {
			...raw,
			employee_name: raw.employee ? `${raw.employee.first_name} ${raw.employee.last_name}` : "",
			remaining_debt: Math.max(0, totalDebt - paidAmount),
		};
	});

	res.json({ success: true, data: formatted });
}));

// Create garnishment
router.post("/garnishments", validate(garnishmentSchema), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	Logger.info("[GarnishmentsController] Create garnishment", { companyId });

	const garnishment = await EmployeeGarnishments.create({
		...req.body,
		company_id: companyId,
		created_by: userId,
	});

	res.status(201).json({ success: true, data: garnishment, message: "İcra kaydı başarıyla oluşturuldu" });
}));

// Update garnishment
router.put("/garnishments/:id", validate(garnishmentSchema), asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const { id } = req.params;
	Logger.info("[GarnishmentsController] Update garnishment", { companyId, id });

	const [updated] = await EmployeeGarnishments.update(req.body, {
		where: { id, company_id: companyId },
	});

	if (!updated) {
		res.status(404).json({ success: false, message: "İcra kaydı bulunamadı" });
		return;
	}

	res.json({ success: true, message: "İcra kaydı güncellendi" });
}));

// Delete garnishment
router.delete("/garnishments/:id", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	const { id } = req.params;
	Logger.info("[GarnishmentsController] Delete garnishment", { companyId, id });

	const garnishment = await EmployeeGarnishments.findOne({ where: { id, company_id: companyId } });
	if (!garnishment) {
		res.status(404).json({ success: false, message: "İcra kaydı bulunamadı" });
		return;
	}

	garnishment.deleted_by = userId;
	await garnishment.save();
	await garnishment.destroy();

	res.json({ success: true, message: "İcra kaydı silindi" });
}));

export default router;
