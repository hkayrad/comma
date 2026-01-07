import express from "express";
import { TwoFactorService } from "../services/TwoFactorService";
import { Logger } from "../lib/utils/logger";
import { ApiResponse } from "../lib/utils/apiResponse";
import { authMiddleware } from "../lib/middleware";
import { authRateLimiter } from "../lib/middleware/rateLimiter";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Middleware to verify temp 2FA token (for partial auth state)
const verify2FATempToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const tempToken = req.body.tempToken || req.headers["x-2fa-temp-token"];

    if (!tempToken) {
        return res.status(401).json(ApiResponse.error("2FA temp token required"));
    }

    try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET as string) as { id: string; purpose: string };

        if (decoded.purpose !== "2fa_verification") {
            return res.status(401).json(ApiResponse.error("Invalid token purpose"));
        }

        req.user = { id: decoded.id } as any;
        next();
    } catch (error) {
        return res.status(401).json(ApiResponse.error("Invalid or expired 2FA token"));
    }
};

/**
 * GET /2fa/status
 * Check if 2FA is enabled for the current user
 */
router.get("/status", authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json(ApiResponse.error("Unauthorized"));
        }

        const enabled = await TwoFactorService.isEnabled(userId);
        return res.json({ enabled });
    } catch (error: any) {
        Logger.error("[TwoFactorController] Error checking 2FA status", { error: error.message });
        return res.status(500).json(ApiResponse.error("Failed to check 2FA status"));
    }
});

/**
 * POST /2fa/setup
 * Initiate 2FA setup - returns QR code and temporary secret
 */
router.post("/setup", authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json(ApiResponse.error("Unauthorized"));
        }

        // Check if 2FA is already enabled
        const isEnabled = await TwoFactorService.isEnabled(userId);
        if (isEnabled) {
            return res.status(400).json(ApiResponse.error("2FA is already enabled"));
        }

        const { qrCode, secret } = await TwoFactorService.initiateSetup(userId);

        // Return QR code and secret (secret is needed for verification step)
        // Secret is sent encrypted via a short-lived token
        const setupToken = jwt.sign(
            { userId, secret, purpose: "2fa_setup" },
            process.env.JWT_SECRET as string,
            { expiresIn: "10m" }
        );

        return res.json({
            qrCode,
            secret,
            setupToken,
        });
    } catch (error: any) {
        Logger.error("[TwoFactorController] Error initiating 2FA setup", { error: error.message });
        return res.status(500).json(ApiResponse.error("Failed to initiate 2FA setup"));
    }
});

/**
 * POST /2fa/verify-setup
 * Verify initial code and complete 2FA setup
 */
router.post("/verify-setup", authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { setupToken, code } = req.body;

        if (!userId) {
            return res.status(401).json(ApiResponse.error("Unauthorized"));
        }

        if (!setupToken || !code) {
            return res.status(400).json(ApiResponse.error("Setup token and verification code are required"));
        }

        // Verify and decode the setup token
        let decoded: { userId: string; secret: string; purpose: string };
        try {
            decoded = jwt.verify(setupToken, process.env.JWT_SECRET as string) as any;
        } catch {
            return res.status(400).json(ApiResponse.error("Setup session expired. Please start again."));
        }

        if (decoded.purpose !== "2fa_setup" || decoded.userId !== userId) {
            return res.status(400).json(ApiResponse.error("Invalid setup token"));
        }

        const result = await TwoFactorService.completeSetup(userId, decoded.secret, code);

        if (!result.success) {
            return res.status(400).json(ApiResponse.error(result.message));
        }

        Logger.info("[TwoFactorController] 2FA setup completed", { userId });

        return res.json({
            success: true,
            recoveryCodes: result.recoveryCodes,
            message: result.message,
        });
    } catch (error: any) {
        Logger.error("[TwoFactorController] Error completing 2FA setup", { error: error.message });
        return res.status(500).json(ApiResponse.error("Failed to complete 2FA setup"));
    }
});

/**
 * POST /2fa/verify
 * Verify 2FA code during login (uses temp token from partial auth)
 */
router.post("/verify", authRateLimiter, verify2FATempToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { code } = req.body;

        if (!userId) {
            return res.status(401).json(ApiResponse.error("Unauthorized"));
        }

        if (!code) {
            return res.status(400).json(ApiResponse.error("Verification code is required"));
        }

        const result = await TwoFactorService.verifyLogin(userId, code);

        if (!result.success) {
            return res.status(401).json({
                success: false,
                locked: result.locked,
                attemptsRemaining: result.attemptsRemaining,
                remainingTime: result.remainingTime,
                message: result.message,
            });
        }

        // 2FA verified - issue full tokens
        // Import the token generation logic from AuthService
        const { AuthService } = await import("../services/AuthService");
        const loginResult = await AuthService.Complete2FALogin(userId);

        if (!loginResult.success) {
            return res.status(500).json(ApiResponse.error("Failed to complete login"));
        }

        res.cookie("access_token", loginResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie("refresh_token", loginResult.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: parseInt(process.env.JWT_EXPIRES_IN || "7") * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.json({
            success: true,
            username: loginResult.user?.username,
            role: loginResult.user?.role,
        });
    } catch (error: any) {
        Logger.error("[TwoFactorController] Error verifying 2FA", { error: error.message });
        return res.status(500).json(ApiResponse.error("Failed to verify 2FA"));
    }
});

/**
 * POST /2fa/recovery
 * Use a recovery code to bypass 2FA
 */
router.post("/recovery", authRateLimiter, verify2FATempToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { code } = req.body;

        if (!userId) {
            return res.status(401).json(ApiResponse.error("Unauthorized"));
        }

        if (!code) {
            return res.status(400).json(ApiResponse.error("Recovery code is required"));
        }

        const result = await TwoFactorService.useRecoveryCode(userId, code);

        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.message,
            });
        }

        // Recovery code verified - issue full tokens
        const { AuthService } = await import("../services/AuthService");
        const loginResult = await AuthService.Complete2FALogin(userId);

        if (!loginResult.success) {
            return res.status(500).json(ApiResponse.error("Failed to complete login"));
        }

        res.cookie("access_token", loginResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });
        res.cookie("refresh_token", loginResult.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: parseInt(process.env.JWT_EXPIRES_IN || "7") * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.json({
            success: true,
            remainingCodes: result.remainingCodes,
            username: loginResult.user?.username,
            role: loginResult.user?.role,
        });
    } catch (error: any) {
        Logger.error("[TwoFactorController] Error using recovery code", { error: error.message });
        return res.status(500).json(ApiResponse.error("Failed to use recovery code"));
    }
});

/**
 * POST /2fa/disable
 * Disable 2FA for the current user
 */
router.post("/disable", authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { password, code } = req.body;

        if (!userId) {
            return res.status(401).json(ApiResponse.error("Unauthorized"));
        }

        if (!password || !code) {
            return res.status(400).json(ApiResponse.error("Password and 2FA code are required"));
        }

        const result = await TwoFactorService.disable(userId, password, code);

        if (!result.success) {
            return res.status(400).json(ApiResponse.error(result.message));
        }

        Logger.info("[TwoFactorController] 2FA disabled", { userId });

        return res.json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        Logger.error("[TwoFactorController] Error disabling 2FA", { error: error.message });
        return res.status(500).json(ApiResponse.error("Failed to disable 2FA"));
    }
});

export default router;
