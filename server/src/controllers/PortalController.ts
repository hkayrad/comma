import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Logger } from "@/lib/utils/logger";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { validate } from "@/lib/utils/middleware/validate";
import { portalLoginSchema } from "@comma/common/schemas";
import { UserRole } from "@comma/common/enums";
import ReceivableCustomersService from "@/services/Receivable/CustomersService";
import { CustomerRepository } from "@/repositories/CustomerRepository";
import { portalAuthMiddleware } from "@/lib/middleware";

const router = express.Router();
const customerRepository = new CustomerRepository("receivable");

router.post("/login", validate(portalLoginSchema), asyncHandler(async (req: Request, res: Response) => {
	const { companyId, tax_number } = req.body;
	Logger.info("[PortalController] Login attempt", { companyId, tax_number });

	const customer = await customerRepository.findByTaxNumber(tax_number, companyId);
	if (!customer) {
		return res.status(401).json({ success: false, message: "Invalid credentials" });
	}

	const tokenPayload = {
		id: customer.id,
		companyId: customer.company_id,
		role: UserRole.PORTAL_CUSTOMER,
		username: customer.name,
	};

	const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as jwt.Secret, {
		expiresIn: "1h",
	});

	res.cookie("portal_token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 60 * 1000,
	});

	res.json({ success: true, message: "Portal login successful" });
}));

router.get("/overview", portalAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
	const { id, companyId } = req.user;
	Logger.info("[PortalController] Overview request", { customerId: id, companyId });

	const statement = await ReceivableCustomersService.GetStatement(id, companyId);
	if (!statement) {
		return res.status(404).json({ success: false, message: "Customer not found" });
	}

	res.json({
		success: true,
		data: {
			customer: statement.customer,
		},
	});
}));

router.get("/statement", portalAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
	const { id, companyId } = req.user;
	const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
	Logger.info("[PortalController] Statement request", { customerId: id, companyId });

	const data = await ReceivableCustomersService.GetStatement(id, companyId, startDate, endDate);
	res.json({ success: true, data });
}));

export default router;
