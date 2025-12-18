import express, { Request, Response } from "express";
import ReceivableDebtsService from "../../services/Receivable/DebtsService";
import { authMiddleware } from "../../lib/middleware";
import { Logger } from "../../lib/utils/logger";
import { DebtDto } from "@common/types";

const router = express.Router();

router.use(authMiddleware);

router.post("/debts", async (req: Request<{}, {}, DebtDto>, res: Response) => {
	const debt = req.body;
	const { id: userId, companyId } = req.user;

	Logger.info("[ReceivableDebtsController] Create debt request", { companyId, customerId: debt.customer_id });

	try {
		const response = await ReceivableDebtsService.Create(debt,userId, companyId);

		Logger.info("[ReceivableDebtsController] Create debt result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivableDebtsController] Error creating debt", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error creating debt" });
	}
});

router.get("/debts/totals", async (req: Request<{}, {}, {}, { currency?: string }>, res: Response) => {
	const { currency } = req.query;
	const companyId = req.user.companyId;

	Logger.debug("[ReceivableDebtsController] Get debt totals request", { companyId, currency });

	try {
		const response = await ReceivableDebtsService.GetTotals(companyId, currency as string);

		Logger.debug("[ReceivableDebtsController] Get debt totals result", {
			companyId,
			currency,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivableDebtsController] Error fetching debt totals", {
			companyId,
			currency,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error fetching debt totals" });
	}
});

router.get("/debts", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const page = parseInt(req.query.page as string) || 0;
	const limit = parseInt(req.query.limit as string) || 20;

	Logger.debug("[ReceivableDebtsController] Get all debts request", { companyId, page, limit });

	try {
		const response = await ReceivableDebtsService.GetAll(companyId, page, limit);

		Logger.debug("[ReceivableDebtsController] Get all debts result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivableDebtsController] Error fetching debts", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error fetching debts" });
	}
});

router.put("/debts/:id", async (req: Request<{ id: string }, {}, DebtDto>, res: Response) => {
	const { id } = req.params;
	const debt = req.body;
	const companyId = req.user.companyId;

	Logger.info("[ReceivableDebtsController] Update debt request", { debtId: id, companyId });

	try {
		const response = await ReceivableDebtsService.Update(id, debt, companyId);

		Logger.info("[ReceivableDebtsController] Update debt result", { debtId: id, companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivableDebtsController] Error updating debt", { debtId: id, companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error updating debt" });
	}
});

router.delete("/debts/:id", async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	const { id: userId, companyId } = req.user;

	Logger.info("[ReceivableDebtsController] Delete debt request", { debtId: id, companyId });

	try {
		const response = await ReceivableDebtsService.Delete(id,userId, companyId);

		Logger.info("[ReceivableDebtsController] Delete debt result", { debtId: id, companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivableDebtsController] Error deleting debt", { debtId: id, companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error deleting debt" });
	}
});

export default router;
