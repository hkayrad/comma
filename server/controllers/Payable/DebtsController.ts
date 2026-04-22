import express, { Request, Response } from "express";
import PayableDebtsService from "@/services/Payable/DebtsService";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { DebtDto } from "@common/types";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { debtSchema, paginationSchema } from "@common/schemas";

const router = express.Router();

router.use(authMiddleware);

router.post("/debts", validate(debtSchema), asyncHandler(async (req: Request<{}, {}, DebtDto>, res: Response) => {
	const debt = req.body;
	const { id: userId, companyId } = req.user;
	Logger.info("[PayableDebtsController] Create debt request", { companyId, customerId: debt.customer_id });

	const id = await PayableDebtsService.Create(debt, userId, companyId);
	res.json({ success: true, data: id, message: "Debt created successfully" });
}));

router.get("/debts/totals", asyncHandler(async (req: Request<{}, {}, {}, { currency?: string }>, res: Response) => {
	const { currency } = req.query;
	const companyId = req.user.companyId;
	Logger.debug("[PayableDebtsController] Get debt totals request", { companyId, currency });

	const data = await PayableDebtsService.GetTotals(companyId, currency as string);
	res.json({ success: true, data });
}));

router.get("/debts", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const { page, limit, sorting, filters } = req.query as any;
	Logger.debug("[PayableDebtsController] Get all debts request", { companyId, page, limit });

	const data = await PayableDebtsService.GetAll(companyId, page, limit, sorting, filters);
	res.json({ success: true, data });
}));

router.put("/debts/:id", validate(debtSchema), asyncHandler(async (req: Request<{ id: string }, {}, DebtDto>, res: Response) => {
	const { id } = req.params;
	const debt = req.body;
	const companyId = req.user.companyId;
	Logger.info("[PayableDebtsController] Update debt request", { debtId: id, companyId });

	await PayableDebtsService.Update(id, debt, companyId);
	res.json({ success: true, message: "Debt updated successfully" });
}));

router.delete("/debts/:id", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	const { id: userId, companyId } = req.user;
	Logger.info("[PayableDebtsController] Delete debt request", { debtId: id, companyId });

	await PayableDebtsService.Delete(id, userId, companyId);
	res.json({ success: true, message: "Debt deleted successfully" });
}));

router.get("/debts/upcoming-due-dates", asyncHandler(async (req: Request<{}, {}, {}, { days?: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const daysThreshold = parseInt(req.query.days as string) || 7;
	Logger.debug("[PayableDebtsController] Get upcoming due dates request", { companyId, daysThreshold });

	const data = await PayableDebtsService.GetUpcomingDueDates(companyId, daysThreshold);
	res.json({ success: true, data });
}));

export default router;

