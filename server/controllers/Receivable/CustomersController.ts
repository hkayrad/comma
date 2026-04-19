import express, { Request, Response } from "express";
import ReceivableCustomersService from "../../services/Receivable/CustomersService";
import { authMiddleware } from "../../lib/middleware";
import { Logger } from "../../lib/utils/logger";
import { CustomerDto } from "@common/types";
import { asyncHandler } from "../../lib/utils/middleware/asyncHandler";
import { validate } from "../../lib/utils/middleware/validate";
import { customerSchema, paginationSchema } from "@common/schemas";

const router = express.Router();

router.use(authMiddleware);

router.post("/customers", validate(customerSchema), asyncHandler(async (req: Request<{}, {}, CustomerDto>, res: Response) => {
	const customer = req.body;
	const { companyId, id: userId } = req.user;

	Logger.info("[ReceivableCustomersController] Create customer request", { companyId, customerName: customer.name });

	const id = await ReceivableCustomersService.Create(customer, userId, companyId);
	res.json({ success: true, data: id, message: "Customer created successfully" });
}));

router.get("/customers", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const { page, limit, sorting, filters } = req.query as any;

	Logger.debug("[ReceivableCustomersController] Get all customers request", { companyId, page, limit });

	const data = await ReceivableCustomersService.GetAll(companyId, page, limit, sorting, filters);
	res.json({ success: true, data });
}));

router.get("/customers/:id/statement",
	asyncHandler(async (req: Request<{ id: string }, {}, {}, { startDate?: string; endDate?: string }>, res: Response) => {
		const { id } = req.params;
		const { startDate, endDate } = req.query;
		const companyId = req.user.companyId;

		Logger.debug("[ReceivableCustomersController] Get customer statement request", { customerId: id, companyId });

		const data = await ReceivableCustomersService.GetStatement(id, companyId, startDate, endDate);
		res.json({ success: true, data });
	})
);

router.get("/customers/id-name", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;

	Logger.debug("[ReceivableCustomersController] Get customer IDs and names request", { companyId });

	const data = await ReceivableCustomersService.GetIdAndName(companyId);
	res.json({ success: true, data });
}));

router.put("/customers/:id", validate(customerSchema), asyncHandler(async (req: Request<{ id: string }, {}, CustomerDto>, res: Response) => {
	const { id } = req.params;
	const customer = req.body;
	const companyId = req.user.companyId;

	Logger.info("[ReceivableCustomersController] Update customer request", { customerId: id, companyId });

	await ReceivableCustomersService.Update(id, customer, companyId);
	res.json({ success: true, message: "Customer updated successfully" });
}));

router.delete("/customers/:id", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	const { id: userId, companyId } = req.user;

	Logger.info("[ReceivableCustomersController] Delete customer request", { customerId: id, companyId });

	await ReceivableCustomersService.Delete(id, userId, companyId);
	res.json({ success: true, message: "Customer deleted successfully" });
}));

export default router;

