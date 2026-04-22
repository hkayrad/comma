import express, { Request, Response } from "express";
import ReceivablePaymentsService from "@/services/Receivable/PaymentsService";
import { Logger } from "@/lib/utils/logger";
import { authMiddleware } from "@/lib/middleware";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { paymentSchema, paginationSchema } from "@comma/common/schemas";

const router = express.Router();

router.use(authMiddleware);

router.post("/payments", validate(paymentSchema), asyncHandler(async (req: Request, res: Response) => {
	const payment = req.body;
	const { id: userId, companyId } = req.user;
	Logger.info("[ReceivablePaymentsController] Create payment request", { companyId, customerId: payment.customer_id });

	const data = await ReceivablePaymentsService.Create(payment, userId, companyId);
	res.json({ success: true, data, message: "Payment created successfully" });
}));

router.get("/payments", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const { page, limit, sorting, filters } = req.query as any;
	Logger.debug("[ReceivablePaymentsController] Get all payments request", { companyId, page, limit });

	const data = await ReceivablePaymentsService.GetAll(companyId, page, limit, sorting, filters);
	res.json({ success: true, data });
}));

router.put("/payments/:id", validate(paymentSchema), asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payment = req.body;
	const companyId = req.user.companyId;
	Logger.info("[ReceivablePaymentsController] Update payment request", { paymentId: id, companyId });

	await ReceivablePaymentsService.Update(id, payment, companyId);
	res.json({ success: true, message: "Payment updated successfully" });
}));

router.delete("/payments/:id", asyncHandler(async (req: Request, res: Response) => {
	const paymentId = req.params.id;
	const { id: userId, companyId } = req.user;
	Logger.info("[ReceivablePaymentsController] Delete payment request", { paymentId, companyId });

	await ReceivablePaymentsService.Delete(paymentId, userId, companyId);
	res.json({ success: true, message: "Payment deleted successfully" });
}));

router.get("/payments/upcoming-checks", asyncHandler(async (req: Request<{}, {}, {}, { days?: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const daysThreshold = parseInt(req.query.days as string) || 7;
	Logger.debug("[ReceivablePaymentsController] Get upcoming checks request", { companyId, daysThreshold });

	const data = await ReceivablePaymentsService.GetUpcomingChecks(companyId, daysThreshold);
	res.json({ success: true, data });
}));

export default router;

