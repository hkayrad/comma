import express from "express";
import { TwoFactorService } from "@/services/TwoFactorService";
import { Logger } from "@/lib/utils/logger";
import { env } from "@/lib/utils/env";
import { authMiddleware } from "@/lib/middleware";
import { authRateLimiter } from "@/lib/utils/middleware/rateLimiter";
import { asyncHandler } from "@/lib/utils/middleware/asyncHandler";
import { UnauthorizedError, ValidationError } from "@/lib/errors/AppError";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify temp 2FA token (for partial auth state)
const verify2FATempToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const tempToken = req.body.tempToken || req.headers["x-2fa-temp-token"];

  if (!tempToken) {
    throw new UnauthorizedError("2FA temp token required");
  }

  try {
    const decoded = jwt.verify(tempToken, env.JWT_SECRET) as {
      id: string;
      purpose: string;
    };

    if (decoded.purpose !== "2fa_verification") {
      throw new UnauthorizedError("Invalid token purpose");
    }

    req.user = { id: decoded.id } as any;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError("Invalid or expired 2FA token");
  }
};

/**
 * GET /2fa/status
 * Check if 2FA is enabled for the current user
 */
router.get("/status", authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Unauthorized");

  const enabled = await TwoFactorService.isEnabled(userId);
  res.json({ enabled });
}));

/**
 * POST /2fa/setup
 * Initiate 2FA setup - returns QR code and temporary secret
 */
router.post("/setup", authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Unauthorized");

  const isEnabled = await TwoFactorService.isEnabled(userId);
  if (isEnabled) throw new ValidationError("2FA is already enabled");

  const { qrCode, secret } = await TwoFactorService.initiateSetup(userId);

  const setupToken = jwt.sign(
    { userId, secret, purpose: "2fa_setup" },
    env.JWT_SECRET,
    { expiresIn: "10m" },
  );

  res.json({ qrCode, secret, setupToken });
}));

/**
 * POST /2fa/verify-setup
 * Verify initial code and complete 2FA setup
 */
router.post("/verify-setup", authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { setupToken, code } = req.body;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!setupToken || !code) throw new ValidationError("Setup token and verification code are required");

  // Verify and decode the setup token
  let decoded: { userId: string; secret: string; purpose: string };
  try {
    decoded = jwt.verify(setupToken, env.JWT_SECRET) as typeof decoded;
  } catch {
    throw new ValidationError("Setup session expired. Please start again.");
  }

  if (decoded.purpose !== "2fa_setup" || decoded.userId !== userId) {
    throw new ValidationError("Invalid setup token");
  }

  const result = await TwoFactorService.completeSetup(userId, decoded.secret, code);

  if (!result.success) {
    throw new ValidationError(result.message);
  }

  Logger.info("[TwoFactorController] 2FA setup completed", { userId });

  res.json({
    success: true,
    recoveryCodes: result.recoveryCodes,
    message: result.message,
  });
}));

/**
 * POST /2fa/verify
 * Verify 2FA code during login (uses temp token from partial auth)
 */
router.post("/verify", authRateLimiter, verify2FATempToken, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { code } = req.body;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!code) throw new ValidationError("Verification code is required");

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
  const { AuthService } = await import("@/services/AuthService");
  const loginResult = await AuthService.Complete2FALogin(userId);

  if (!loginResult.success) {
    throw new UnauthorizedError("Failed to complete login");
  }

  res.cookie("access_token", loginResult.accessToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refresh_token", loginResult.refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    maxAge: parseInt(env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({
    success: true,
    username: loginResult.user?.username,
    role: loginResult.user?.role,
  });
}));

/**
 * POST /2fa/recovery
 * Use a recovery code to bypass 2FA
 */
router.post("/recovery", authRateLimiter, verify2FATempToken, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { code } = req.body;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!code) throw new ValidationError("Recovery code is required");

  const result = await TwoFactorService.useRecoveryCode(userId, code);

  if (!result.success) {
    return res.status(401).json({
      success: false,
      message: result.message,
    });
  }

  // Recovery code verified - issue full tokens
  const { AuthService } = await import("@/services/AuthService");
  const loginResult = await AuthService.Complete2FALogin(userId);

  if (!loginResult.success) {
    throw new UnauthorizedError("Failed to complete login");
  }

  res.cookie("access_token", loginResult.accessToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refresh_token", loginResult.refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    maxAge: parseInt(env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({
    success: true,
    remainingCodes: result.remainingCodes,
    username: loginResult.user?.username,
    role: loginResult.user?.role,
  });
}));

/**
 * POST /2fa/disable
 * Disable 2FA for the current user
 */
router.post("/disable", authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { password } = req.body;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!password) throw new ValidationError("Password is required to disable 2FA");

  const result = await TwoFactorService.disable(userId, password);

  if (!result.success) {
    throw new ValidationError(result.message);
  }

  Logger.info("[TwoFactorController] 2FA disabled", { userId });

  res.json({
    success: true,
    message: result.message,
  });
}));

export default router;

