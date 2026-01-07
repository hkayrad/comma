import express from "express";
import { AuthService } from "../services/AuthService";
import { Logger } from "../lib/utils/logger";
import { ApiResponse } from "../lib/utils/apiResponse";
import dotenv from "dotenv";
import { authRateLimiter } from "../lib/middleware/rateLimiter";

dotenv.config();

const router = express.Router();

router.post("/login", authRateLimiter, async (req, res) => {
	const { username, password } = req.body;
	Logger.info("[AuthController] Login attempt", { username: username });

	if (!username || !password) {
		Logger.warn("[AuthController] Missing credentials", { username: !!username, password: !!password });
		return res.status(400).json(ApiResponse.error("Username and password are required"));
	}

	const response = await AuthService.Login(username, password);

	const { success, requires2FA, accessToken, refreshToken, tempToken, message, user } = response;

	Logger.info("[AuthController] Login result", { username, success, requires2FA });

	if (!success) {
		return res.status(401).json(ApiResponse.error(message));
	}

	// If 2FA is required, return temp token for client to use for 2FA verification
	if (requires2FA) {
		return res.json({
			requires2FA: true,
			tempToken: tempToken,
			username: user?.username,
		});
	}

	// Normal login - set cookies
	res.cookie("access_token", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie("refresh_token", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: parseInt(process.env.JWT_EXPIRES_IN || "7") * 24 * 60 * 60 * 1000, // 7 days
		path: "/",
	});
	return res.json({ username: user?.username, role: user?.role });
});

router.post("/refresh", authRateLimiter, async (req, res) => {
	const reqRefreshToken = req.cookies.refresh_token;

	if (!reqRefreshToken) {
		return res.status(401).json(ApiResponse.error("Refresh token is missing"));
	}

	const response = await AuthService.RefreshToken(reqRefreshToken);

	if (!response) {
		return res.status(401).json(ApiResponse.error("Token refresh failed"));
	}

	const { success, accessToken, refreshToken, message, user } = response;

	Logger.info("[AuthController] Refresh result", { username: user?.username, success: success });

	if (!success) return res.status(401).json(ApiResponse.error(message));

	res.cookie("access_token", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	res.cookie("refresh_token", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: parseInt(process.env.JWT_EXPIRES_IN || "7") * 24 * 60 * 60 * 1000, // 7 days
		path: "/",
	});

	return res.json({ username: user?.username, role: user?.role });
});

router.post("/logout", async (req, res) => {
	const refreshToken = req.cookies.refresh_token;

	if (refreshToken) {
		await AuthService.Logout(refreshToken);
	}

	res.clearCookie("access_token");
	res.clearCookie("refresh_token", {
		path: "/",
	});
	return res.json({ message: "Logged out successfully" });
});

export default router;
