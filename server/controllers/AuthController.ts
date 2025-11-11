import express, { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { ApiResponse, Logger } from "../lib/utils";
import { DecodedJwtToken } from "@common/types";

const router = express.Router();

router.post("/login", async (req: Request<{}, {}, { username: string; password: string }>, res: Response) => {
	const { username, password } = req.body;

	Logger.info("[AuthController] Login attempt", { username });

	if (!username || !password) {
		Logger.warn("[AuthController] Missing credentials", { username: !!username, password: !!password });
		return res.status(400).json(ApiResponse.error("Username and password are required"));
	}

	try {
		const response = await AuthService.Login(username, password);

		Logger.info("[AuthController] Login result", { username, success: response.success });
		return res.json(response);
	} catch (error: any) {
		Logger.error("[AuthController] Login error", { username, error: error.message });
		return res.status(500).json(ApiResponse.error("Error during login"));
	}
});

router.post("/verify", async (req: Request<{}, {}, { token: string }>, res: Response) => {
	const { token } = req.body;

	Logger.debug("[AuthController] Token verification request");

	if (!token) {
		Logger.warn("[AuthController] Missing token");
		return res.status(400).json({ success: false, message: "Token is required" });
	}

	try {
		const decoded = (await AuthService.VerifyToken(token)) as DecodedJwtToken | null;

		if (decoded) {
			Logger.debug("[AuthController] Token verified successfully", { userId: decoded.id });
			return res.json({ success: true, decoded });
		} else {
			Logger.warn("[AuthController] Invalid token");
			return res.json({ success: false, message: "Invalid token" });
		}
	} catch (error: any) {
		Logger.error("[AuthController] Token verification error", { error: error.message });
		return res.status(500).json({ success: false, message: "Error verifying token" });
	}
});

export default router;
