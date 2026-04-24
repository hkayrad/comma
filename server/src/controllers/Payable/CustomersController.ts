import express, { Request, Response } from "express";
import PayableCustomersService from "@/services/Payable/CustomersService";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { CustomerDto } from "@comma/common/types";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { customerSchema, paginationSchema } from "@comma/common/schemas";

const router = express.Router();

router.use(authMiddleware);

router.post("/customers", validate(customerSchema), asyncHandler(async (req: Request<{}, {}, CustomerDto>, res: Response) => {
	const customer = req.body;
	const { companyId, id: userId } = req.user;
	Logger.info("[PayableCustomersController] Create customer request", { companyId, customerName: customer.name });

	const id = await PayableCustomersService.Create(customer, userId, companyId);
	res.json({ success: true, data: id, message: "Customer created successfully" });
}));

router.get("/customers", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	const { page, limit, sorting, filters } = req.query as any;
	Logger.debug("[PayableCustomersController] Get all customers request", { companyId, page, limit });

	const data = await PayableCustomersService.GetAll(companyId, page, limit, sorting, filters);
	res.json({ success: true, data });
}));

router.get("/customers/:id/statement",
	asyncHandler(async (req: Request<{ id: string }, {}, {}, { startDate?: string; endDate?: string }>, res: Response) => {
		const { id } = req.params;
		const { startDate, endDate } = req.query;
		const companyId = req.user.companyId;
		Logger.debug("[PayableCustomersController] Get customer statement request", { customerId: id, companyId });

		const data = await PayableCustomersService.GetStatement(id, companyId, startDate, endDate);
		res.json({ success: true, data });
	})
);

router.get("/customers/id-name", asyncHandler(async (req: Request, res: Response) => {
	const companyId = req.user.companyId;
	Logger.debug("[PayableCustomersController] Get customer IDs and names request", { companyId });

	const data = await PayableCustomersService.GetIdAndName(companyId);
	res.json({ success: true, data });
}));

router.put("/customers/:id", validate(customerSchema), asyncHandler(async (req: Request<{ id: string }, {}, CustomerDto>, res: Response) => {
	const { id } = req.params;
	const customer = req.body;
	const companyId = req.user.companyId;
	Logger.info("[PayableCustomersController] Update customer request", { customerId: id, companyId });

	await PayableCustomersService.Update(id, customer, companyId);
	res.json({ success: true, message: "Customer updated successfully" });
}));

router.delete("/customers/:id", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	const { id: userId, companyId } = req.user;
	Logger.info("[PayableCustomersController] Delete customer request", { customerId: id, companyId });

	await PayableCustomersService.Delete(id, userId, companyId);
	res.json({ success: true, message: "Customer deleted successfully" });
}));

router.post("/customers/:id/restore", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	const { id: userId, companyId } = req.user;
	Logger.info("[PayableCustomersController] Restore customer request", { customerId: id, companyId });

	await PayableCustomersService.Restore(id, userId, companyId);
	res.json({ success: true, message: "Restored successfully" });
}));

export default router;

