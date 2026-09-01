import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { advanceSchema } from "@comma/common/schemas";
import { EmployeeAdvances, Employees } from "@/models";

const router = express.Router();
router.use(authMiddleware);

// Get all advances
router.get("/advances", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.debug("[AdvancesController] Get advances", { companyId });

	const advances = await EmployeeAdvances.findAll({
		where: { company_id: companyId },
		include: [{ model: Employees, as: "employee", attributes: ["first_name", "last_name"] }],
		order: [["request_date", "DESC"]],
	});

	const formatted = advances.map((adv) => {
		const raw = adv.toJSON() as any;
		return {
			...raw,
			employee_name: raw.employee ? `${raw.employee.first_name} ${raw.employee.last_name}` : "",
		};
	});

	res.json({ success: true, data: formatted });
}));

// Create advance
router.post("/advances", validate(advanceSchema), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	Logger.info("[AdvancesController] Create advance", { companyId });

	const advance = await EmployeeAdvances.create({
		...req.body,
		company_id: companyId,
		created_by: userId,
	});

	res.status(201).json({ success: true, data: advance, message: "Avans kaydı başarıyla oluşturuldu" });
}));

// Update advance status or data
router.put("/advances/:id", validate(advanceSchema), asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const { id } = req.params;
	Logger.info("[AdvancesController] Update advance", { companyId, id });

	const [updated] = await EmployeeAdvances.update(req.body, {
		where: { id, company_id: companyId },
	});

	if (!updated) {
		res.status(404).json({ success: false, message: "Avans kaydı bulunamadı" });
		return;
	}

	res.json({ success: true, message: "Avans kaydı güncellendi" });
}));

// Delete advance
router.delete("/advances/:id", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	const { id } = req.params;
	Logger.info("[AdvancesController] Delete advance", { companyId, id });

	const advance = await EmployeeAdvances.findOne({ where: { id, company_id: companyId } });
	if (!advance) {
		res.status(404).json({ success: false, message: "Avans kaydı bulunamadı" });
		return;
	}

	advance.deleted_by = userId;
	await advance.save();
	await advance.destroy();

	res.json({ success: true, message: "Avans kaydı silindi" });
}));

export default router;
