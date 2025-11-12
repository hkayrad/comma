import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { Logger } from "./logger";
import jwt from "jsonwebtoken";
import { ApiResponse } from "./apiResponse";

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
			return res.status(401).json(ApiResponse.error("Unauthorized"));
		}

		jwt.verify(accessToken, process.env.JWT_SECRET as jwt.Secret, (err: any, user: any) => {
			if (err) return res.status(401).json(ApiResponse.error("Unauthorized"));

			req.user = user;
			next();
		});
	} catch (error) {
		Logger.error("[AuthMiddleware] Error verifying token", { error });
		return res.status(401).json(ApiResponse.error("Unauthorized"));
	}
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
