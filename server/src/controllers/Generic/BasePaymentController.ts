import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { paymentSchema, paginationSchema, batchPaymentSchema, bulkDeleteSchema } from "@comma/common/schemas";

export function createPaymentController(service: any, label: string) {
	const router = express.Router();
	router.use(authMiddleware);

	router.post("/payments", validate(paymentSchema), asyncHandler(async (req: Request, res: Response) => {
		const payment = req.body;
		const { id: userId, companyId } = req.user;
		Logger.info(`[${label}Controller] Create payment request`, { companyId, customerId: payment.customer_id });

		const data = await service.Create(payment, userId, companyId);
		res.json({ success: true, data, message: "Payment created successfully" });
	}));

	router.post("/payments/batch", validate(batchPaymentSchema), asyncHandler(async (req: Request, res: Response) => {
		const payments = req.body;
		const { id: userId, companyId } = req.user;
		Logger.info(`[${label}Controller] Create payments batch request`, { companyId, count: payments.length });

		const result = await service.CreateBatch(payments, userId, companyId);
		res.status(201).json({ success: true, data: result, message: "Payments created successfully" });
	}));

	router.get("/payments", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
		const companyId = req.user.companyId;
		const { page, limit, sorting, filters } = req.query as any;
		Logger.debug(`[${label}Controller] Get all payments request`, { companyId, page, limit });

		const data = await service.GetAll(companyId, page, limit, sorting, filters);
		res.json({ success: true, data });
	}));

	router.put("/payments/:id", validate(paymentSchema), asyncHandler(async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const payment = req.body;
		const companyId = req.user.companyId;
		Logger.info(`[${label}Controller] Update payment request`, { paymentId: id, companyId });

		await service.Update(id, payment, companyId);
		res.json({ success: true, message: "Payment updated successfully" });
	}));

	router.delete("/payments/:id", asyncHandler(async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const { id: userId, companyId } = req.user;
		Logger.info(`[${label}Controller] Delete payment request`, { paymentId: id, companyId });

		await service.Delete(id, userId, companyId);
		res.json({ success: true, message: "Payment deleted successfully" });
	}));

	router.post("/payments/bulk-delete", validate(bulkDeleteSchema), asyncHandler(async (req: Request, res: Response) => {
		const { ids } = req.body;
		const { id: userId, companyId } = req.user;
		Logger.info(`[${label}Controller] Bulk delete payments request`, { companyId, count: ids.length });

		const deletedCount = await service.DeleteBatch(ids, userId, companyId);
		res.json({ success: true, data: { count: deletedCount }, message: "Payments deleted successfully" });
	}));

	router.post("/payments/:id/restore", asyncHandler(async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const { id: userId, companyId } = req.user;
		Logger.info(`[${label}Controller] Restore payment request`, { paymentId: id, companyId });

		await service.Restore(id, userId, companyId);
		res.json({ success: true, message: "Restored successfully" });
	}));

	router.get("/payments/upcoming-checks", asyncHandler(async (req: Request<{}, {}, {}, { days?: string }>, res: Response) => {
		const companyId = req.user.companyId;
		const daysThreshold = parseInt(req.query.days as string) || 7;
		Logger.debug(`[${label}Controller] Get upcoming checks request`, { companyId, daysThreshold });

		const data = await service.GetUpcomingChecks(companyId, daysThreshold);
		res.json({ success: true, data });
	}));

	return router;
}
