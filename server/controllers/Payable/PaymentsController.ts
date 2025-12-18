import express, { Request, Response } from "express";
import PayablePaymentsService from "../../services/Payable/PaymentsService";
import { authMiddleware } from "../../lib/middleware";
import { Logger } from "../../lib/utils/logger";
import { PaymentDto } from "@common/types";

const router = express.Router();

router.use(authMiddleware);

router.post("/payments", async (req: Request<{}, {}, PaymentDto>, res: Response) => {
	const payment = req.body;
	const { id: userId, companyId } = req.user;

	Logger.info("[PayablePaymentsController] Create payment request", { companyId, customerId: payment.customer_id });

	try {
		const response = await PayablePaymentsService.Create(payment, userId, companyId);

		Logger.info("[PayablePaymentsController] Create payment result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayablePaymentsController] Error creating payment", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error creating payment" });
	}
});

router.get("/payments", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const page = parseInt(req.query.page as string) || 0;
	const limit = parseInt(req.query.limit as string) || 20;
	const sorting = req.query.sorting ? JSON.parse(req.query.sorting as string) : [];
	const filters = req.query.filters ? JSON.parse(req.query.filters as string) : [];

	Logger.debug("[PayablePaymentsController] Get all payments request", { companyId, page, limit, sorting, filters });

	try {
		const response = await PayablePaymentsService.GetAll(companyId, page, limit, sorting, filters);

		Logger.debug("[PayablePaymentsController] Get all payments result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayablePaymentsController] Error fetching payments", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error fetching payments" });
	}
});

router.put("/payments/:id", async (req: Request<{ id: string }, {}, PaymentDto>, res: Response) => {
	const { id } = req.params;
	const payment = req.body;
	const companyId = req.user.companyId;

	Logger.info("[PayablePaymentsController] Update payment request", { paymentId: id, companyId });

	try {
		const response = await PayablePaymentsService.Update(id, payment, companyId);

		Logger.info("[PayablePaymentsController] Update payment result", {
			paymentId: id,
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayablePaymentsController] Error updating payment", {
			paymentId: id,
			companyId,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error updating payment" });
	}
});

router.delete("/payments/:id", async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	const { id: userId, companyId } = req.user;

	Logger.info("[PayablePaymentsController] Delete payment request", { paymentId: id, companyId });

	try {
		const response = await PayablePaymentsService.Delete(id, userId, companyId);

		Logger.info("[PayablePaymentsController] Delete payment result", {
			paymentId: id,
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayablePaymentsController] Error deleting payment", {
			paymentId: id,
			companyId,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error deleting payment" });
	}
});

export default router;
