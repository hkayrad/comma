import express, { Request, Response } from "express";
import { authMiddleware } from "@/lib/middleware";
import { Logger } from "@/lib/utils/logger";
import { CustomerDto } from "@comma/common/types";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { customerSchema, paginationSchema, batchCustomerSchema } from "@comma/common/schemas";

export function createCustomerController(service: any, label: string) {
  const router = express.Router();

  router.use(authMiddleware);

  router.post("/customers", validate(customerSchema), asyncHandler(async (req: Request<{}, {}, CustomerDto>, res: Response) => {
    const customer = req.body;
    const { companyId, id: userId } = req.user;

    Logger.info(`[${label}Controller] Create customer request`, { companyId, customerName: customer.name });

    const id = await service.Create(customer, userId, companyId);
    res.json({ success: true, data: id, message: "Customer created successfully" });
  }));

  router.post("/customers/batch", validate(batchCustomerSchema), asyncHandler(async (req: Request<{}, {}, CustomerDto[]>, res: Response) => {
    const customers = req.body;
    const { companyId, id: userId } = req.user;
    Logger.info(`[${label}Controller] Create customers batch request`, { companyId, count: customers.length });

    const result = await service.CreateBatch(customers, userId, companyId);
    res.status(201).json({ success: true, data: result, message: "Customers created successfully" });
  }));

  router.get("/customers", validate(paginationSchema, "query"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user.companyId;
    const { page, limit, sorting, filters } = req.query as any;

    Logger.debug(`[${label}Controller] Get all customers request`, { companyId, page, limit });

    const data = await service.GetAll(companyId, page, limit, sorting, filters);
    res.json({ success: true, data });
  }));

  router.get("/customers/:id/summary", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const companyId = req.user.companyId;
    Logger.debug(`[${label}Controller] Get customer summary request`, { customerId: id, companyId });
    const data = await service.GetSummary(id, companyId);
    res.json({ success: true, data });
  }));

  router.get("/customers/:id/statement",
    asyncHandler(async (req: Request<{ id: string }, {}, {}, { startDate?: string; endDate?: string }>, res: Response) => {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      const companyId = req.user.companyId;

      Logger.debug(`[${label}Controller] Get customer statement request`, { customerId: id, companyId });

      const data = await service.GetStatement(id, companyId, startDate, endDate);
      res.json({ success: true, data });
    })
  );

  router.get("/customers/id-name", asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user.companyId;

    Logger.debug(`[${label}Controller] Get customer IDs and names request`, { companyId });

    const data = await service.GetIdAndName(companyId);
    res.json({ success: true, data });
  }));

  router.put("/customers/:id", validate(customerSchema), asyncHandler(async (req: Request<{ id: string }, {}, CustomerDto>, res: Response) => {
    const { id } = req.params;
    const customer = req.body;
    const companyId = req.user.companyId;

    Logger.info(`[${label}Controller] Update customer request`, { customerId: id, companyId });

    await service.Update(id, customer, companyId);
    res.json({ success: true, message: "Customer updated successfully" });
  }));

  router.delete("/customers/:id", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const { id: userId, companyId } = req.user;

    Logger.info(`[${label}Controller] Delete customer request`, { customerId: id, companyId });

    await service.Delete(id, userId, companyId);
    res.json({ success: true, message: "Customer deleted successfully" });
  }));

  router.post("/customers/:id/restore", asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const { id: userId, companyId } = req.user;

    Logger.info(`[${label}Controller] Restore customer request`, { customerId: id, companyId });

    await service.Restore(id, userId, companyId);
    res.json({ success: true, message: "Restored successfully" });
  }));

  return router;
}
