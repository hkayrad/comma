import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { attendanceSchema, batchAttendanceSchema } from "@comma/common/schemas";
import { EmployeeAttendances, Employees } from "@/models";
import { Op } from "sequelize";

const router = express.Router();
router.use(authMiddleware);

// Get attendances for date range or month
router.get("/attendance", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const { startDate, endDate, employeeId } = req.query as { startDate?: string; endDate?: string; employeeId?: string };
	Logger.debug("[AttendanceController] Get attendances", { companyId, startDate, endDate, employeeId });

	const whereClause: any = { company_id: companyId };
	if (employeeId) {
		whereClause.employee_id = employeeId;
	}
	if (startDate && endDate) {
		whereClause.date = { [Op.between]: [startDate, endDate] };
	} else if (startDate) {
		whereClause.date = { [Op.gte]: startDate };
	}

	const attendances = await EmployeeAttendances.findAll({
		where: whereClause,
		include: [{ model: Employees, as: "employee", attributes: ["first_name", "last_name"] }],
		order: [["date", "DESC"]],
	});

	const formatted = attendances.map((att) => {
		const raw = att.toJSON() as any;
		return {
			...raw,
			employee_name: raw.employee ? `${raw.employee.first_name} ${raw.employee.last_name}` : "",
		};
	});

	res.json({ success: true, data: formatted });
}));

// Create or update attendance record (Upsert)
router.post("/attendance", validate(attendanceSchema), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	const { employee_id, date, check_in_time, check_out_time, status, overtime_hours, overtime_multiplier, notes } = req.body;
	Logger.info("[AttendanceController] Upsert attendance", { companyId, employee_id, date });

	const [attendance, created] = await EmployeeAttendances.findOrCreate({
		where: { company_id: companyId, employee_id, date },
		defaults: {
			company_id: companyId,
			employee_id,
			date,
			check_in_time,
			check_out_time,
			status,
			overtime_hours,
			overtime_multiplier,
			notes,
			created_by: userId,
		},
	});

	if (!created) {
		await attendance.update({
			check_in_time,
			check_out_time,
			status,
			overtime_hours,
			overtime_multiplier,
			notes,
		});
	}

	res.status(created ? 201 : 200).json({
		success: true,
		data: attendance,
		message: created ? "Giriş-çıkış kaydı oluşturuldu" : "Giriş-çıkış kaydı güncellendi",
	});
}));

// Batch upsert attendance records (Puantaj Toplu Giriş)
router.post("/attendance/batch", validate(batchAttendanceSchema), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	const items: any[] = req.body;
	Logger.info("[AttendanceController] Batch upsert attendance", { companyId, count: items.length });

	for (const item of items) {
		const [attendance, created] = await EmployeeAttendances.findOrCreate({
			where: { company_id: companyId, employee_id: item.employee_id, date: item.date },
			defaults: {
				...item,
				company_id: companyId,
				created_by: userId,
			},
		});

		if (!created) {
			await attendance.update(item);
		}
	}

	res.json({ success: true, message: `${items.length} puantaj kaydı başarıyla işlendi.` });
}));

// Delete attendance record
router.delete("/attendance/:id", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	const { id } = req.params;
	Logger.info("[AttendanceController] Delete attendance", { companyId, id });

	const attendance = await EmployeeAttendances.findOne({ where: { id, company_id: companyId } });
	if (!attendance) {
		res.status(404).json({ success: false, message: "Kayıt bulunamadı" });
		return;
	}

	attendance.deleted_by = userId;
	await attendance.save();
	await attendance.destroy();

	res.json({ success: true, message: "Kayıt silindi" });
}));

export default router;
