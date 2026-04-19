import express, { Request, Response } from "express";
import PayablePaymentsService from "../../services/Payable/PaymentsService";
import { authMiddleware } from "../../lib/middleware";
import { Logger } from "../../lib/utils/logger";
import { asyncHandler } from "../../lib/utils/middleware/asyncHandler";
import { validate } from "../../lib/utils/middleware/validate";
import { paymentSchema, paginationSchema } from "@common/schemas";

const router = express.Router();

router.use(authMiddleware);

router.post("/payments", validate(paymentSchema), asyncHandler(async (req: Request, res: Response) => {
	const payment = req.body;
	const { id: userId, companyId } = req.user;
	Logger.info("[PayablePaymentsController] Create payment request", { companyId, customerId: payment.customer_id });

	const data = await PayablePaymentsService.Create(payment, userId, companyId);
	res.json({ success: true, data, message: "Payment created successfully" });
}));

router.get("/payments", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const { page, limit, sorting, filters } = req.query as any;
	Logger.debug("[PayablePaymentsController] Get all payments request", { companyId, page, limit });

	const data = await PayablePaymentsService.GetAll(companyId, page, limit, sorting, filters);
	res.json({ success: true, data });
}));

router.put("/payments/:id", validate(paymentSchema), asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payment = req.body;
	const companyId = req.user.companyId;
	Logger.info("[PayablePaymentsController] Update payment request", { paymentId: id, companyId });

	await PayablePaymentsService.Update(id, payment, companyId);
	res.json({ success: true, message: "Payment updated successfully" });
}));

router.delete("/payments/:id", asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	const { id: userId, companyId } = req.user;
	Logger.info("[PayablePaymentsController] Delete payment request", { paymentId: id, companyId });

	await PayablePaymentsService.Delete(id, userId, companyId);
	res.json({ success: true, message: "Payment deleted successfully" });
}));

router.get("/payments/upcoming-checks", asyncHandler(async (req: Request<{}, {}, {}, { days?: string }>, res: Response) => {
	const companyId = req.user.companyId;
	const daysThreshold = parseInt(req.query.days as string) || 7;
	Logger.debug("[PayablePaymentsController] Get upcoming checks request", { companyId, daysThreshold });

	const data = await PayablePaymentsService.GetUpcomingChecks(companyId, daysThreshold);
	res.json({ success: true, data });
}));

export default router;

