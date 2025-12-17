import express, { Request, Response } from "express";
import ReceivablePaymentsService from "../../services/Receivable/PaymentsService";
import { Logger } from "../../lib/utils/logger";
import { authMiddleware } from "../../lib/middleware";

const router = express.Router();

router.use(authMiddleware);

router.post("/payments", async (req: Request, res: Response) => {
	const payment = req.body;
	const { id: userId, companyId } = req.user;

	Logger.info("[ReceivablePaymentsController] Create payment request", { companyId, customerId: payment.customer_id });

	try {
		const response = await ReceivablePaymentsService.Create(payment, userId, companyId);

		Logger.info("[ReceivablePaymentsController] Create payment result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivablePaymentsController] Error creating payment", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error creating payment" });
	}
});

router.get("/payments", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.debug("[ReceivablePaymentsController] Get all payments request", { companyId });

	try {
		const response = await ReceivablePaymentsService.GetAll(companyId);

		Logger.debug("[ReceivablePaymentsController] Get all payments result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivablePaymentsController] Error fetching payments", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error fetching payments" });
	}
});

router.put("/payments/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	const payment = req.body;
	const companyId = req.user.companyId;

	Logger.info("[ReceivablePaymentsController] Update payment request", { paymentId: id, companyId });

	try {
		const response = await ReceivablePaymentsService.Update(id, payment, companyId);

		Logger.info("[ReceivablePaymentsController] Update payment result", {
			paymentId: id,
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivablePaymentsController] Error updating payment", {
			paymentId: id,
			companyId,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error updating payment" });
	}
});

router.delete("/payments/:id", async (req: Request, res: Response) => {
	const paymentId = req.params.id;
	const { id: userId, companyId } = req.user;

	Logger.info("[ReceivablePaymentsController] Delete payment request", { paymentId, companyId });

	try {
		const response = await ReceivablePaymentsService.Delete(paymentId, userId, companyId);

		Logger.info("[ReceivablePaymentsController] Delete payment result", {
			paymentId,
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivablePaymentsController] Error deleting payment", {
			paymentId,
			companyId,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error deleting payment" });
	}
});

export default router;
