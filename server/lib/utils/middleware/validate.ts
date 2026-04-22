import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "@/lib/errors/AppError";

/**
 * Express middleware factory that validates request data against a Zod schema.
 *
 * @param schema - The Zod schema to validate against
 * @param source - Which part of the request to validate ("body", "query", or "params")
 * @returns Express middleware that validates and replaces the request data
 *
 * On success, replaces req[source] with the parsed (coerced/defaulted) data.
 * On failure, throws a ValidationError with formatted Zod issues.
 */
export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
	return (req: Request, _res: Response, next: NextFunction) => {
		const result = schema.safeParse(req[source]);
		if (!result.success) {
			const messages = result.error.issues.map((e) => `${String(e.path.join("."))}: ${e.message}`).join("; ");
			throw new ValidationError(messages);
		}
		// Replace the source with parsed data (coerced/defaulted)
		// We use defineProperty because req.query/params can sometimes be read-only getters
		Object.defineProperty(req, source, {
			value: result.data,
			writable: true,
			configurable: true,
			enumerable: true
		});
		next();
	};
}
