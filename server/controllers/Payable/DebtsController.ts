import express, { Request, Response } from "express";
import PayableDebtsService from "../../services/Payable/DebtsService";
import { authMiddleware } from "../../lib/utils/middleware";
import { Logger } from "../../lib/utils";
import { DebtDto } from "@common/types";

const router = express.Router();

router.use(authMiddleware);

router.post("/debts", async (req: Request<{}, {}, DebtDto>, res: Response) => {
	const debt = req.body;
	const companyId = req.user.companyId;

	Logger.info("[PayableDebtsController] Create debt request", { companyId, customerId: debt.customer_id });

	try {
		const response = await PayableDebtsService.Create(debt, companyId);

		Logger.info("[PayableDebtsController] Create debt result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableDebtsController] Error creating debt", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error creating debt" });
	}
});

router.get("/debts/totals", async (req: Request<{}, {}, {}, { currency?: string }>, res: Response) => {
	const { currency } = req.query;
	const companyId = req.user.companyId;

	Logger.debug("[PayableDebtsController] Get debt totals request", { companyId, currency });

	try {
		const response = await PayableDebtsService.GetTotals(companyId, currency as string);

		Logger.debug("[PayableDebtsController] Get debt totals result", { companyId, currency, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableDebtsController] Error fetching debt totals", { companyId, currency, error: error.message });
		return res.status(500).json({ success: false, message: "Error fetching debt totals" });
	}
});

router.get("/debts", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.debug("[PayableDebtsController] Get all debts request", { companyId });

	try {
		const response = await PayableDebtsService.GetAll(companyId);

		Logger.debug("[PayableDebtsController] Get all debts result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableDebtsController] Error fetching debts", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error fetching debts" });
	}
});

router.put("/debts/:id", async (req: Request<{ id: string }, {}, DebtDto>, res: Response) => {
	const { id } = req.params;
	const debt = req.body;
	const companyId = req.user.companyId;

	Logger.info("[PayableDebtsController] Update debt request", { debtId: id, companyId });

	try {
		const response = await PayableDebtsService.Update(id, debt, companyId);

		Logger.info("[PayableDebtsController] Update debt result", { debtId: id, companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableDebtsController] Error updating debt", { debtId: id, companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error updating debt" });
	}
});

router.delete("/debts/:id", async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	const companyId = req.user.companyId;

	Logger.info("[PayableDebtsController] Delete debt request", { debtId: id, companyId });

	try {
		const response = await PayableDebtsService.Delete(id, companyId);

		Logger.info("[PayableDebtsController] Delete debt result", { debtId: id, companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableDebtsController] Error deleting debt", { debtId: id, companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error deleting debt" });
	}
});

export default router;
