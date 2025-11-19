import express, { Request, Response } from "express";
import PayableCustomersService from "../../services/Payable/CustomersService";
import { authMiddleware } from "../../lib/middleware";
import { Logger } from "../../lib/utils";
import { CustomerDto } from "@common/types";

const router = express.Router();

router.use(authMiddleware);

router.post("/customers", async (req: Request<{}, {}, CustomerDto>, res: Response) => {
	const customer = req.body;
	const { companyId, id: userId } = req.user;

	Logger.info("[PayableCustomersController] Create customer request", {
		companyId: companyId,
		customerName: customer.name,
	});

	try {
		const response = await PayableCustomersService.Create(customer, userId, companyId);

		Logger.info("[PayableCustomersController] Create customer result", {
			companyId: companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableCustomersController] Error creating customer", {
			companyId: companyId,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error creating customer" });
	}
});

router.get("/customers", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.debug("[PayableCustomersController] Get all customers request", { companyId });

	try {
		const response = await PayableCustomersService.GetAll(companyId);

		Logger.debug("[PayableCustomersController] Get all customers result", { companyId, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableCustomersController] Error fetching customers", { companyId, error: error.message });
		return res.status(500).json({ success: false, message: "Error fetching customers" });
	}
});

router.get("/customers/:id/statement", async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	const companyId = req.user.companyId;

	Logger.debug("[PayableCustomersController] Get customer statement request", { customerId: id, companyId });

	try {
		const response = await PayableCustomersService.GetStatement(id, companyId);

		Logger.debug("[PayableCustomersController] Get customer statement result", {
			customerId: id,
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableCustomersController] Error fetching customer statement", {
			customerId: id,
			companyId,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error fetching customer statement" });
	}
});

router.get("/customers/id-name", async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.debug("[PayableCustomersController] Get customer IDs and names request", { companyId });

	try {
		const response = await PayableCustomersService.GetIdAndName(companyId);

		Logger.debug("[PayableCustomersController] Get customer IDs and names result", {
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableCustomersController] Error fetching customer IDs and names", {
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

	Logger.info("[PayableCustomersController] Update customer request", { customerId: id, companyId });

	try {
		const response = await PayableCustomersService.Update(id, customer, companyId);

		Logger.info("[PayableCustomersController] Update customer result", {
			customerId: id,
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableCustomersController] Error updating customer", {
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

	Logger.info("[PayableCustomersController] Delete customer request", { customerId: id, companyId });

	try {
		const response = await PayableCustomersService.Delete(id, userId, companyId);

		Logger.info("[PayableCustomersController] Delete customer result", {
			customerId: id,
			companyId,
			success: response.success,
		});
		return res.json(response);
	} catch (error: any) {
		Logger.error("[PayableCustomersController] Error deleting customer", {
			customerId: id,
			companyId,
			error: error.message,
		});
		return res.status(500).json({ success: false, message: "Error deleting customer" });
	}
});

export default router;
