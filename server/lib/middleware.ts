import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { Logger } from "./utils/logger";
import jwt from "jsonwebtoken";

dotenv.config();

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
	Logger.debug("[AuthMiddleware] Request received", {
		method: req.method,
		path: req.path,
	});

	try {
		const accessToken = req.cookies.access_token;

		if (!accessToken) {
			Logger.warn("[AuthMiddleware] Access token missing");
			return res.status(401).json({ success: false, data: null, message: "Unauthorized" });
		}

		jwt.verify(accessToken, process.env.JWT_SECRET as jwt.Secret, (err: any, user: any) => {
			if (err) return res.status(401).json({ success: false, data: null, message: "Unauthorized" });

			req.user = user;
			next();
		});
	} catch (error) {
		Logger.error("[AuthMiddleware] Error verifying token", { error });
		return res.status(401).json({ success: false, data: null, message: "Unauthorized" });
	}
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
	authMiddleware(req, res, (err) => {
		if (err) return next(err);

		const role = req.user.role;

		if (role !== 99) {
			Logger.warn("[AdminMiddleware] User is not an admin");
			return res.status(403).json({ success: false, data: null, message: "Forbidden" });
		}

		next();
	});
}

export function configMiddleware(req: Request, res: Response, next: NextFunction) {
	Logger.debug("[ConfigMiddleware] Request received", {
		method: req.method,
		path: req.path,
	});

	// allow public GET /
	if (req.path === "/" && req.method === "GET") {
		Logger.debug("[ConfigMiddleware] Public route - skipping auth", { path: req.path });
		return next();
	}

	Logger.debug("[ConfigMiddleware] Checking auth");
	authMiddleware(req, res, next);
}
