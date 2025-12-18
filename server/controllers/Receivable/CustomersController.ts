import express, { Request, Response } from "express";
import ReceivableCustomersService from "../../services/Receivable/CustomersService";
import { authMiddleware } from "../../lib/middleware";
import { Logger } from "../../lib/utils/logger";
import { CustomerDto } from "@common/types";

const router = express.Router();

router.use(authMiddleware);

router.post("/customers", async (req: Request<{}, {}, CustomerDto>, res: Response) => {
	const customer = req.body;
	const { companyId, id: userId } = req.user;

	Logger.info("[ReceivableCustomersController] Create customer request", { companyId, customerName: customer.name });

	try {
		const response = await ReceivableCustomersService.Create(customer, userId, companyId);

		Logger.info("[ReceivableCustomersController] Create customer result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivableCustomersController] Error creating customer", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error creating customer" });
	}
});

router.get("/customers", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const page = parseInt(req.query.page as string) || 0;
	const limit = parseInt(req.query.limit as string) || 20;
	const sorting = req.query.sorting ? JSON.parse(req.query.sorting as string) : [];
	const filters = req.query.filters ? JSON.parse(req.query.filters as string) : [];

	Logger.debug("[ReceivableCustomersController] Get all customers request", { companyId, page, limit, sorting, filters });

	try {
		const response = await ReceivableCustomersService.GetAll(companyId, page, limit, sorting, filters);

		Logger.debug("[ReceivableCustomersController] Get all customers result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivableCustomersController] Error fetching customers", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error fetching customers" });
	}
});

router.get(
	"/customers/:id/statement",
	async (req: Request<{ id: string }, {}, {}, { startDate?: string; endDate?: string }>, res: Response) => {
		const { id } = req.params;
		const { startDate, endDate } = req.query;
		const companyId = req.user.companyId;

		Logger.debug("[ReceivableCustomersController] Get customer statement request", {
			customerId: id,
			companyId,
			startDate,
			endDate,
		});

		try {
			const response = await ReceivableCustomersService.GetStatement(id, companyId, startDate, endDate);

			Logger.debug("[ReceivableCustomersController] Get customer statement result", {
				customerId: id,
				companyId,
				success: response.success,
			});
			return res.json(response);
		} catch (error: any) {
			Logger.error("[ReceivableCustomersController] Error fetching customer statement", {
				customerId: id,
				companyId,
				error: error.message,
			});
			return res.status(500).json({ success: false, message: "Error fetching customer statement" });
		}
	}
);

router.get("/customers/id-name", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.debug("[ReceivableCustomersController] Get customer IDs and names request", { companyId });

	try {
		const response = await ReceivableCustomersService.GetIdAndName(companyId);

		Logger.debug("[ReceivableCustomersController] Get customer IDs and names result", {
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivableCustomersController] Error fetching customer IDs and names", {
			companyId,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error fetching customer IDs and names" });
	}
});

router.put("/customers/:id", async (req: Request<{ id: string }, {}, CustomerDto>, res: Response) => {
	const { id } = req.params;
	const customer = req.body;
	const companyId = req.user.companyId;

	Logger.info("[ReceivableCustomersController] Update customer request", { customerId: id, companyId });

	try {
		const response = await ReceivableCustomersService.Update(id, customer, companyId);

		Logger.info("[ReceivableCustomersController] Update customer result", {
			customerId: id,
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivableCustomersController] Error updating customer", {
			customerId: id,
			companyId,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error updating customer" });
	}
});

router.delete("/customers/:id", async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	const { id: userId, companyId } = req.user;

	Logger.info("[ReceivableCustomersController] Delete customer request", { customerId: id, companyId });

	try {
		const response = await ReceivableCustomersService.Delete(id, userId, companyId);

		Logger.info("[ReceivableCustomersController] Delete customer result", {
			customerId: id,
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[ReceivableCustomersController] Error deleting customer", {
			customerId: id,
			companyId,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error deleting customer" });
	}
});

export default router;
