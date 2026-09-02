import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { DebtDto } from "@comma/common/types";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { debtSchema, paginationSchema, batchDebtSchema, bulkDeleteSchema } from "@comma/common/schemas";

export function createDebtController(service: any, label: string) {
	const router = express.Router();
	router.use(authMiddleware);

	router.post("/debts", validate(debtSchema), asyncHandler(async (req: Request<{}, {}, DebtDto>, res: Response) => {
		const debt = req.body;
		const { id: userId, companyId } = req.user;
		Logger.info(`[${label}Controller] Create debt request`, { companyId, customerId: debt.customer_id });

		const id = await service.Create(debt, userId, companyId);
		res.json({ success: true, data: id, message: "Debt created successfully" });
	}));

	router.post("/debts/batch", validate(batchDebtSchema), asyncHandler(async (req: Request<{}, {}, DebtDto[]>, res: Response) => {
		const debts = req.body;
		const { id: userId, companyId } = req.user;
		Logger.info(`[${label}Controller] Create debts batch request`, { companyId, count: debts.length });

		const result = await service.CreateBatch(debts, userId, companyId);
		res.status(201).json({ success: true, data: result, message: "Debts created successfully" });
	}));

	router.get("/debts/totals", asyncHandler(async (req: Request<{}, {}, {}, { currency?: string }>, res: Response) => {
		const { currency } = req.query;
		const companyId = req.user.companyId;
		Logger.debug(`[${label}Controller] Get debt totals request`, { companyId, currency });

		const data = await service.GetTotals(companyId, currency as string);
		res.json({ success: true, data });
	}));

	router.get("/debts", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
		const companyId = req.user.companyId;
		const { page, limit, sorting, filters } = req.query as any;
		Logger.debug(`[${label}Controller] Get all debts request`, { companyId, page, limit });

		const data = await service.GetAll(companyId, page, limit, sorting, filters);
		res.json({ success: true, data });
	}));

	router.put("/debts/:id", validate(debtSchema), asyncHandler(async (req: Request<{ id: string }, {}, DebtDto>, res: Response) => {
		const { id } = req.params;
		const debt = req.body;
		const companyId = req.user.companyId;
		Logger.info(`[${label}Controller] Update debt request`, { debtId: id, companyId });

		await service.Update(id, debt, companyId);
		res.json({ success: true, message: "Debt updated successfully" });
	}));

	router.delete("/debts/:id", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
		const { id } = req.params;
		const { id: userId, companyId } = req.user;
		Logger.info(`[${label}Controller] Delete debt request`, { debtId: id, companyId });

		await service.Delete(id, userId, companyId);
		res.json({ success: true, message: "Debt deleted successfully" });
	}));

	router.post("/debts/bulk-delete", validate(bulkDeleteSchema), asyncHandler(async (req: Request, res: Response) => {
		const { ids } = req.body;
		const { id: userId, companyId } = req.user;
		Logger.info(`[${label}Controller] Bulk delete debts request`, { companyId, count: ids.length });

		const deletedCount = await service.DeleteBatch(ids, userId, companyId);
		res.json({ success: true, data: { count: deletedCount }, message: "Debts deleted successfully" });
	}));

	router.post("/debts/:id/restore", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
		const { id } = req.params;
		const { id: userId, companyId } = req.user;
		Logger.info(`[${label}Controller] Restore debt request`, { debtId: id, companyId });

		await service.Restore(id, userId, companyId);
		res.json({ success: true, message: "Restored successfully" });
	}));

	router.get("/debts/upcoming-due-dates", asyncHandler(async (req: Request<{}, {}, {}, { days?: string }>, res: Response) => {
		const companyId = req.user.companyId;
		const daysThreshold = parseInt(req.query.days as string) || 7;
		Logger.debug(`[${label}Controller] Get upcoming due dates request`, { companyId, daysThreshold });

		const data = await service.GetUpcomingDueDates(companyId, daysThreshold);
		res.json({ success: true, data });
	}));

	return router;
}
