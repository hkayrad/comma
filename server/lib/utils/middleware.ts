import { NextFunction, Request, Response } from "express";
import verifyUser from "./verifyUser";
import { Logger } from "./logger";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
	Logger.debug("[AuthMiddleware] Request received", {
		method: req.method,
		path: req.path,
	});

	try {
		const authHeader = req.headers["authorization"];

		if (!authHeader) {
			Logger.error("[AuthMiddleware] No authorization header provided", { path: req.path });
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		const token = authHeader?.split(" ")[1];

		if (token == null || token === "null" || token === "undefined" || token === undefined) {
			Logger.error("[AuthMiddleware] Invalid or missing token", { path: req.path });
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		Logger.debug("[AuthMiddleware] Verifying token");
		const decoded = verifyUser(token);

		if (!decoded) {
			Logger.error("[AuthMiddleware] Token verification failed", { path: req.path });
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		const companyId = decoded.companyId;

		if (!companyId) {
			Logger.error("[AuthMiddleware] No company ID in token", { userId: decoded.id });
			return res.status(400).json({ success: false, message: "Company ID is required" });
		}

		req.companyId = companyId;
		Logger.debug("[AuthMiddleware] Authentication successful", {
			companyId,
			userId: decoded.id,
			path: req.path,
		});

		next();
	} catch (error) {
		Logger.error("[AuthMiddleware] Error in authentication", error);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
}
