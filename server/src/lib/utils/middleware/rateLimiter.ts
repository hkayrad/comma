import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: { success: false, data: null, message: "Too many login attempts, please try again later." },
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const globalRateLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 1000, // Limit each IP to 1000 requests per windowMs
	message: { success: false, data: null, message: "Too many requests from this IP, please try again after an hour." },
	standardHeaders: true,
	legacyHeaders: false,
});
