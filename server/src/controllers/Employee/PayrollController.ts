import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { payrollSchema } from "@comma/common/schemas";
import { EmployeePayrolls, Employees, EmployeeAttendances, EmployeeAdvances, EmployeeGarnishments } from "@/models";
import { Op } from "sequelize";

const router = express.Router();
router.use(authMiddleware);

// Get payrolls for a given year & month
router.get("/payroll", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const { year, month } = req.query as { year?: string; month?: string };
	Logger.debug("[PayrollController] Get payrolls", { companyId, year, month });

	const whereClause: any = { company_id: companyId };
	if (year) whereClause.period_year = Number(year);
	if (month) whereClause.period_month = Number(month);

	const payrolls = await EmployeePayrolls.findAll({
		where: whereClause,
		include: [{ model: Employees, as: "employee", attributes: ["first_name", "last_name", "iban", "bank_name", "title"] }],
		order: [["period_year", "DESC"], ["period_month", "DESC"]],
	});

	const formatted = payrolls.map((pr) => {
		const raw = pr.toJSON() as any;
		return {
			...raw,
			employee_name: raw.employee ? `${raw.employee.first_name} ${raw.employee.last_name}` : "",
		};
	});

	res.json({ success: true, data: formatted });
}));

// Calculate payroll preview for a given employee and month
router.get("/payroll/calculate-preview", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const { employee_id, year, month } = req.query as { employee_id: string; year: string; month: string };
	Logger.info("[PayrollController] Calculate payroll preview", { companyId, employee_id, year, month });

	const employee = await Employees.findOne({ where: { id: employee_id, company_id: companyId } });
	if (!employee) {
		res.status(404).json({ success: false, message: "Çalışan bulunamadı" });
		return;
	}

	const yr = Number(year);
	const mo = Number(month);
	const startDate = `${yr}-${String(mo).padStart(2, "0")}-01`;
	const lastDay = new Date(yr, mo, 0).getDate();
	const endDate = `${yr}-${String(mo).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

	// Existing payroll check for recalculation handling
	const existingPayroll = await EmployeePayrolls.findOne({
		where: {
			company_id: companyId,
			employee_id,
			period_year: yr,
			period_month: mo,
		},
	});

	// Fetch attendances for period
	const attendances = await EmployeeAttendances.findAll({
		where: {
			company_id: companyId,
			employee_id,
			date: { [Op.between]: [startDate, endDate] },
		},
	});

	let unexcusedAbsentCount = 0;
	let overtimePay = 0;
	const dailyRate = Number(employee.base_salary) / 30;
	const hourlyRate = (Number(employee.base_salary) / 225); // Standart 225 saat

	attendances.forEach((att) => {
		if (att.status === "ABSENT_UNEXCUSED") {
			unexcusedAbsentCount += 1;
		} else if (att.status === "HALF_DAY") {
			unexcusedAbsentCount += 0.5;
		}

		if (Number(att.overtime_hours) > 0) {
			const mult = Number(att.overtime_multiplier) || 1.5;
			overtimePay += Number(att.overtime_hours) * hourlyRate * mult;
		}
	});

	const absenceDeduction = unexcusedAbsentCount * dailyRate;
	const workingDays = Math.max(0, 30 - unexcusedAbsentCount);

	// Fetch approved advances requested up to period end date
	const approvedAdvances = await EmployeeAdvances.findAll({
		where: {
			company_id: companyId,
			employee_id,
			status: "APPROVED",
			request_date: { [Op.lte]: endDate },
		},
	});
	const approvedSum = approvedAdvances.reduce((sum, adv) => sum + Number(adv.amount), 0);
	const existingAdvanceDeduction = existingPayroll ? Number(existingPayroll.advance_deduction) : 0;
	const advanceDeduction = approvedSum + existingAdvanceDeduction;

	// Fetch active garnishments ordered chronologically (Priority Queue / Sıra Cetveli)
	const garnishments = await EmployeeGarnishments.findAll({
		where: {
			company_id: companyId,
			employee_id,
			status: { [Op.in]: ["ACTIVE", "COMPLETED"] },
		},
		order: [["created_at", "ASC"]],
	});

	// Total monthly legal garnishment capacity limit (default 25% of base salary)
	let capacityLeft = (Number(employee.base_salary) * 25) / 100;
	let garnishmentDeduction = 0;
	const existingGarnishmentDeduction = existingPayroll ? Number(existingPayroll.garnishment_deduction) : 0;

	// In Turkish Labor Law, garnishments are queued chronologically.
	// Primary active garnishment gets deducted. If its remaining debt is smaller than monthly capacity,
	// the remaining capacity spills over to the next garnishment in line!
	for (const gar of garnishments) {
		if (capacityLeft <= 0) break;
		if (gar.status === "PAUSED") continue;
		if (gar.start_date && String(gar.start_date) > endDate) continue;

		const totalDebt = Number(gar.total_debt);
		const paid = Number(gar.paid_amount);

		// Effective paid before this payroll period
		const effectivePaid = Math.max(0, paid - existingGarnishmentDeduction);
		const remaining = totalDebt - effectivePaid;

		if (remaining > 0) {
			let garLimit = capacityLeft;
			if (gar.deduction_type === "PERCENTAGE") {
				const garCalculated = (Number(employee.base_salary) * Number(gar.deduction_value)) / 100;
				garLimit = Math.min(capacityLeft, garCalculated);
			} else {
				garLimit = Math.min(capacityLeft, Number(gar.deduction_value));
			}

			const actualDeduction = Math.min(garLimit, remaining);
			garnishmentDeduction += actualDeduction;
			capacityLeft -= actualDeduction;
		}
	}



	const netPayable = Math.max(
		0,
		Number(employee.base_salary) + overtimePay - (absenceDeduction + advanceDeduction + garnishmentDeduction),
	);

	res.json({
		success: true,
		data: {
			employee_id,
			period_year: yr,
			period_month: mo,
			base_salary: Number(employee.base_salary),
			working_days: workingDays,
			absent_days: unexcusedAbsentCount,
			absence_deduction: Math.round(absenceDeduction * 100) / 100,
			overtime_pay: Math.round(overtimePay * 100) / 100,
			bonus_pay: 0,
			advance_deduction: Math.round(advanceDeduction * 100) / 100,
			garnishment_deduction: Math.round(garnishmentDeduction * 100) / 100,
			net_payable: Math.round(netPayable * 100) / 100,
		},
	});
}));

// Save payroll record
router.post("/payroll", validate(payrollSchema), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	const body = req.body;
	Logger.info("[PayrollController] Create or update payroll", { companyId, employee_id: body.employee_id });

	const yr = Number(body.period_year);
	const mo = Number(body.period_month);
	const lastDay = new Date(yr, mo, 0).getDate();
	const endDate = `${yr}-${String(mo).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

	const existingPayroll = await EmployeePayrolls.findOne({
		where: {
			company_id: companyId,
			employee_id: body.employee_id,
			period_year: yr,
			period_month: mo,
		},
	});

	const oldGarnishmentDeduction = existingPayroll ? Number(existingPayroll.garnishment_deduction) : 0;
	const newGarnishmentDeduction = Number(body.garnishment_deduction) || 0;
	const garnishmentDiff = newGarnishmentDeduction - oldGarnishmentDeduction;

	let payroll: EmployeePayrolls;
	let created = false;

	if (existingPayroll) {
		payroll = existingPayroll;
		await payroll.update(body);
	} else {
		payroll = await EmployeePayrolls.create({
			...body,
			company_id: companyId,
			created_by: userId,
		});
		created = true;
	}

	// Update advance statuses to DEDUCTED if advance_deduction > 0
	if (body.advance_deduction > 0) {
		await EmployeeAdvances.update(
			{ status: "DEDUCTED" },
			{
				where: {
					company_id: companyId,
					employee_id: body.employee_id,
					status: "APPROVED",
					request_date: { [Op.lte]: endDate },
				},
			},
		);
	}


	// Adjust garnishment paid amounts based on difference (ordered chronologically)
	if (garnishmentDiff !== 0) {
		const garnishments = await EmployeeGarnishments.findAll({
			where: { company_id: companyId, employee_id: body.employee_id },
			order: [["created_at", "ASC"]],
		});


		if (garnishmentDiff > 0) {
			let rem = garnishmentDiff;
			for (const gar of garnishments) {
				if (rem <= 0) break;
				if (gar.status === "PAUSED") continue;
				if (gar.start_date && String(gar.start_date) > endDate) continue;
				const total = Number(gar.total_debt);

				const paid = Number(gar.paid_amount);
				const remaining = total - paid;
				if (remaining > 0) {
					const addPaid = Math.min(rem, remaining);
					gar.paid_amount = paid + addPaid;
					if (gar.paid_amount >= total) {
						gar.status = "COMPLETED";
					}
					await gar.save();
					rem -= addPaid;
				}
			}
		} else if (garnishmentDiff < 0) {
			let reduceAmount = Math.abs(garnishmentDiff);
			for (const gar of garnishments) {
				if (reduceAmount <= 0) break;
				const paid = Number(gar.paid_amount);
				if (paid > 0) {
					const subPaid = Math.min(reduceAmount, paid);
					gar.paid_amount = paid - subPaid;
					if (gar.status === "COMPLETED" && gar.paid_amount < Number(gar.total_debt)) {
						gar.status = "ACTIVE";
					}
					await gar.save();
					reduceAmount -= subPaid;
				}
			}
		}
	}

	res.status(created ? 201 : 200).json({
		success: true,
		data: payroll,
		message: created ? "Bordro kaydı oluşturuldu" : "Bordro kaydı güncellendi",
	});
}));

// Delete payroll
router.delete("/payroll/:id", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const userId = req.user.id;
	const { id } = req.params;
	Logger.info("[PayrollController] Delete payroll", { companyId, id });

	const payroll = await EmployeePayrolls.findOne({ where: { id, company_id: companyId } });
	if (!payroll) {
		res.status(404).json({ success: false, message: "Bordro kaydı bulunamadı" });
		return;
	}

	const yr = Number(payroll.period_year);
	const mo = Number(payroll.period_month);
	const startDate = `${yr}-${String(mo).padStart(2, "0")}-01`;
	const lastDay = new Date(yr, mo, 0).getDate();
	const endDate = `${yr}-${String(mo).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

	// Revert advance statuses requested in this period back to APPROVED
	if (Number(payroll.advance_deduction) > 0) {
		await EmployeeAdvances.update(
			{ status: "APPROVED" },
			{
				where: {
					company_id: companyId,
					employee_id: payroll.employee_id,
					status: "DEDUCTED",
					request_date: { [Op.between]: [startDate, endDate] },
				},
			},
		);
	}

	// Revert garnishment paid_amount
	if (Number(payroll.garnishment_deduction) > 0) {
		const garnishments = await EmployeeGarnishments.findAll({
			where: { company_id: companyId, employee_id: payroll.employee_id },
		});
		let reduceAmount = Number(payroll.garnishment_deduction);
		for (const gar of garnishments) {
			if (reduceAmount <= 0) break;
			const paid = Number(gar.paid_amount);
			if (paid > 0) {
				const subPaid = Math.min(reduceAmount, paid);
				gar.paid_amount = paid - subPaid;
				if (gar.status === "COMPLETED" && gar.paid_amount < Number(gar.total_debt)) {
					gar.status = "ACTIVE";
				}
				await gar.save();
				reduceAmount -= subPaid;
			}
		}
	}

	payroll.deleted_by = userId;
	await payroll.save();
	await payroll.destroy();

	res.json({ success: true, message: "Bordro kaydı silindi" });
}));

export default router;
