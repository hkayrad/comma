import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { employeeSchema } from "@comma/common/schemas";
import { Employees } from "@/models/Employees";

const router = express.Router();
router.use(authMiddleware);

// Get all employees
router.get("/list", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.debug("[EmployeesController] Get all employees", { companyId });

	const employees = await Employees.findAll({
		where: { company_id: companyId },
		order: [["first_name", "ASC"], ["last_name", "ASC"]],
	});

	res.json({ success: true, data: employees });
}));

// Create employee
router.post("/list", validate(employeeSchema), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	Logger.info("[EmployeesController] Create employee", { companyId });

	const employee = await Employees.create({
		...req.body,
		company_id: companyId,
		created_by: userId,
	});

	res.status(201).json({ success: true, data: employee, message: "Çalışan başarıyla oluşturuldu" });
}));

// Update employee
router.put("/list/:id", validate(employeeSchema), asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const { id } = req.params;
	Logger.info("[EmployeesController] Update employee", { companyId, id });

	const [updated] = await Employees.update(req.body, {
		where: { id, company_id: companyId },
	});

	if (!updated) {
		res.status(404).json({ success: false, message: "Çalışan bulunamadı" });
		return;
	}

	res.json({ success: true, message: "Çalışan başarıyla güncellendi" });
}));

// Delete employee
router.delete("/list/:id", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	const { id } = req.params;
	Logger.info("[EmployeesController] Delete employee", { companyId, id });

	const employee = await Employees.findOne({ where: { id, company_id: companyId } });
	if (!employee) {
		res.status(404).json({ success: false, message: "Çalışan bulunamadı" });
		return;
	}

	employee.deleted_by = userId;
	await employee.save();
	await employee.destroy();

	res.json({ success: true, message: "Çalışan silindi" });
}));

export default router;
