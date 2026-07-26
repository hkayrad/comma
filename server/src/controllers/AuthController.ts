import express from "express";
import { AuthService } from "@/services/AuthService";
import { Logger } from "@/lib/utils/logger";
import { env } from "@/lib/utils/env";
import { authRateLimiter } from "@/lib/utils/middleware/rateLimiter";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { UnauthorizedError, ValidationError } from "@/lib/errors/AppError";
import { validate } from "@/lib/utils/middleware/validate";
import { loginSchema } from "@comma/common/schemas";

const router = express.Router();

router.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
	const { username, password } = req.body;
	const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || null;
	const userAgent = (req.headers["user-agent"] as string) || null;
	Logger.info("[AuthController] Login attempt", { username });

	const response = await AuthService.Login(username, password, ipAddress, userAgent);

	const { success, requires2FA, accessToken, refreshToken, tempToken, message, user } = response;

	Logger.info("[AuthController] Login result", { username, success, requires2FA });

	if (!success) {
		throw new UnauthorizedError(message);
	}

	// If 2FA is required, return temp token for client to use for 2FA verification
	if (requires2FA) {
		res.json({
			requires2FA: true,
			tempToken: tempToken,
			username: user?.username,
		});
		return;
	}

	// Normal login - set cookies
	res.cookie("access_token", accessToken, {
		httpOnly: true,
		secure: env.isProduction,
		sameSite: "strict",
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie("refresh_token", refreshToken, {
		httpOnly: true,
		secure: env.isProduction,
		sameSite: "strict",
		maxAge: parseInt(env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000, // 7 days
		path: "/",
	});
	res.json({ username: user?.username, role: user?.role });
}));

router.post("/refresh", authRateLimiter, asyncHandler(async (req, res) => {
	const reqRefreshToken = req.cookies.refresh_token;

	if (!reqRefreshToken) {
		throw new UnauthorizedError("Refresh token is missing");
	}

	const response = await AuthService.RefreshToken(reqRefreshToken);

	if (!response) {
		throw new UnauthorizedError("Token refresh failed");
	}

	const { success, accessToken, refreshToken, message, user } = response;

	Logger.info("[AuthController] Refresh result", { username: user?.username, success });

	if (!success) throw new UnauthorizedError(message);

	res.cookie("access_token", accessToken, {
		httpOnly: true,
		secure: env.isProduction,
		sameSite: "strict",
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	res.cookie("refresh_token", refreshToken, {
		httpOnly: true,
		secure: env.isProduction,
		sameSite: "strict",
		maxAge: parseInt(env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000, // 7 days
		path: "/",
	});

	res.json({ username: user?.username, role: user?.role });
}));

router.post("/logout", asyncHandler(async (req, res) => {
	const refreshToken = req.cookies.refresh_token;

	if (refreshToken) {
		await AuthService.Logout(refreshToken);
	}

	res.clearCookie("access_token");
	res.clearCookie("refresh_token", {
		path: "/",
	});
	res.json({ message: "Logged out successfully" });
}));

export default router;
