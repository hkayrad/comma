import { Request, Response, NextFunction } from "express";
import { AppError } from "@/lib/errors/AppError";
import { Logger } from "@/lib/utils/logger";

/**
 * Global error handling middleware.
 * Must be registered LAST in the middleware chain (after all routes).
 *
 * Catches all errors thrown from route handlers and services,
 * logs them, and returns a consistent JSON response.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
	if (err instanceof AppError) {
		// Operational errors — expected failures (validation, not found, etc.)
		if (err.statusCode >= 500) {
			Logger.error(`[ErrorHandler] ${err.message}`, { statusCode: err.statusCode, stack: err.stack });
		} else {
			Logger.warn(`[ErrorHandler] ${err.message}`, { statusCode: err.statusCode });
		}

		res.status(err.statusCode).json({
			success: false,
			message: err.message,
		});
		return;
	}

	// Unexpected errors — programming bugs, unhandled cases
	Logger.error("[ErrorHandler] Unexpected error", {
		message: err.message,
		stack: err.stack,
	});

	res.status(500).json({
		success: false,
		message: process.env.NODE_ENV === "production"
			? "Internal server error"
			: err.message,
	});
}
