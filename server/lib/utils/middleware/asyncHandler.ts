import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler so that any rejected promise
 * is automatically forwarded to Express error handling middleware
 * via next(err).
 *
 * Usage:
 *   router.get("/path", asyncHandler(async (req, res) => { ... }));
 */
export function asyncHandler(
	fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
	return (req, res, next) => {
		Promise.resolve(fn(req as any, res, next)).catch(next);
	};
}
