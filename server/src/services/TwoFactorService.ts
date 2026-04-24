import { Logger } from "@/lib/utils/logger";
import dotenv from "dotenv";
import crypto from "crypto";
import bcrypt from "bcrypt";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { UserRepository } from "@/repositories/UserRepository";
import { Op } from "sequelize";

dotenv.config();

const ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY;
const APP_NAME = process.env.APP_NAME || "Comma";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MIN_DELAY_MS = 500; // Minimum delay for timing attack prevention
const MAX_DELAY_MS = 1500; // Maximum delay for timing attack prevention

export class TwoFactorService {
  /**
   * Introduce a random delay to prevent timing attacks
   */
  private static async randomDelay(): Promise<void> {
    const delay =
      Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) +
      MIN_DELAY_MS;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Generate a new TOTP secret
   */
  static generateSecret(): string {
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  }

  /**
   * Generate a TOTP URI for QR code scanning
   */
  static generateTOTPUri(username: string, secret: string): string {
    const totp = new OTPAuth.TOTP({
      issuer: APP_NAME,
      label: username,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    return totp.toString();
  }

  /**
   * Generate a QR code data URL from a TOTP URI
   */
  static async generateQRCode(uri: string): Promise<string> {
    try {
      return await QRCode.toDataURL(uri, {
        errorCorrectionLevel: "M",
        type: "image/png",
        margin: 2,
        width: 256,
      });
    } catch (err: unknown) {
    	const error = err instanceof Error ? err : new Error(String(err));
      Logger.error("[TwoFactorService] Failed to generate QR code", {
        error: error.message,
      });
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Encrypt a TOTP secret using AES-256-GCM
   */
  static encryptSecret(secret: string): string {
    const encryptionKey = process.env.TOTP_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("TOTP_ENCRYPTION_KEY is not configured");
    }

    const key = Buffer.from(encryptionKey, "hex");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    let encrypted = cipher.update(secret, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  /**
   * Decrypt a TOTP secret
   */
  static decryptSecret(encryptedSecret: string): string {
    const encryptionKey = process.env.TOTP_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("TOTP_ENCRYPTION_KEY is not configured");
    }

    const parts = encryptedSecret.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted secret format");
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const key = Buffer.from(encryptionKey, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Verify a TOTP token
   */
  static verifyToken(secret: string, token: string): boolean {
    const totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    // Allow ±1 time step window for clock drift
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  }

  /**
   * Generate recovery codes
   */
  static generateRecoveryCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 10-character alphanumeric codes
      const code = crypto.randomBytes(5).toString("hex").toUpperCase();
      // Format as XXXXX-XXXXX for readability
      codes.push(`${code.slice(0, 5)}-${code.slice(5)}`);
    }
    return codes;
  }

  /**
   * Hash recovery codes for storage
   */
  static async hashRecoveryCodes(codes: string[]): Promise<string[]> {
    const hashedCodes = await Promise.all(
      codes.map((code) => bcrypt.hash(code.replace("-", ""), 10)),
    );
    return hashedCodes;
  }

  /**
   * Verify and consume a recovery code
   * Returns the index of the matched code, or -1 if not found
   */
  static async verifyRecoveryCode(
    hashedCodes: string[],
    code: string,
  ): Promise<number> {
    const normalizedCode = code.replace("-", "").toUpperCase();

    for (let i = 0; i < hashedCodes.length; i++) {
      if (
        hashedCodes[i] &&
        (await bcrypt.compare(normalizedCode, hashedCodes[i]))
      ) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Check if user is locked out due to failed attempts
   */
  static async checkRateLimit(
    userId: string,
  ): Promise<{ locked: boolean; remainingTime?: number }> {
    const user = await UserRepository.findById(userId);

    if (!user) {
      return { locked: false };
    }

    if (user.totp_lockout_until && new Date() < user.totp_lockout_until) {
      const remainingTime = Math.ceil(
        (user.totp_lockout_until.getTime() - Date.now()) / 1000,
      );
      return { locked: true, remainingTime };
    }

    return { locked: false };
  }

  /**
   * Increment failed attempts and potentially lock the account
   */
  static async incrementFailedAttempts(
    userId: string,
  ): Promise<{ locked: boolean; attemptsRemaining: number }> {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const newAttempts = (user.totp_failed_attempts || 0) + 1;

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      await UserRepository.update(userId, {
        totp_failed_attempts: newAttempts,
        totp_lockout_until: lockoutUntil,
      });
      Logger.warn(
        "[TwoFactorService] User locked out due to failed 2FA attempts",
        { userId },
      );
      return { locked: true, attemptsRemaining: 0 };
    }

    await UserRepository.update(userId, { totp_failed_attempts: newAttempts });

    return {
      locked: false,
      attemptsRemaining: MAX_FAILED_ATTEMPTS - newAttempts,
    };
  }

  /**
   * Reset failed attempts after successful verification
   */
  static async resetFailedAttempts(userId: string): Promise<void> {
    await UserRepository.update(userId, {
      totp_failed_attempts: 0,
      totp_lockout_until: null,
    });
  }

  /**
   * Setup 2FA for a user - returns QR code and temporary secret
   */
  static async initiateSetup(
    userId: string,
  ): Promise<{ qrCode: string; secret: string }> {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const secret = this.generateSecret();
    const uri = this.generateTOTPUri(user.username, secret);
    const qrCode = await this.generateQRCode(uri);

    Logger.info("[TwoFactorService] 2FA setup initiated", { userId });

    return { qrCode, secret };
  }

  /**
   * Complete 2FA setup after user verifies the code
   */
  static async completeSetup(
    userId: string,
    secret: string,
    token: string,
  ): Promise<{ success: boolean; recoveryCodes?: string[]; message: string }> {
    // Verify the token first
    if (!this.verifyToken(secret, token)) {
      Logger.warn("[TwoFactorService] Invalid token during 2FA setup", {
        userId,
      });
      return { success: false, message: "Invalid verification code" };
    }

    // Encrypt and save the secret
    const encryptedSecret = this.encryptSecret(secret);

    // Generate and hash recovery codes
    const recoveryCodes = this.generateRecoveryCodes(10);
    const hashedCodes = await this.hashRecoveryCodes(recoveryCodes);

    await UserRepository.update(userId, {
      totp_secret: encryptedSecret,
      totp_enabled: true,
      totp_recovery_codes: JSON.stringify(hashedCodes),
      totp_failed_attempts: 0,
      totp_lockout_until: null,
    });

    Logger.info("[TwoFactorService] 2FA setup completed", { userId });

    return {
      success: true,
      recoveryCodes,
      message: "2FA enabled successfully",
    };
  }

  /**
   * Verify 2FA during login
   */
  static async verifyLogin(
    userId: string,
    token: string,
  ): Promise<{
    success: boolean;
    locked?: boolean;
    attemptsRemaining?: number;
    remainingTime?: number;
    message: string;
  }> {
    // Add randomized delay to prevent timing attacks
    await this.randomDelay();

    // Check rate limit first
    const rateLimitStatus = await this.checkRateLimit(userId);
    if (rateLimitStatus.locked) {
      return {
        success: false,
        locked: true,
        remainingTime: rateLimitStatus.remainingTime,
        message: `Account locked. Try again in ${Math.ceil((rateLimitStatus.remainingTime || 0) / 60)} minutes`,
      };
    }

    const user = await UserRepository.findById(userId);

    if (!user || !user.totp_enabled || !user.totp_secret) {
      return { success: false, message: "2FA not enabled for this user" };
    }

    const decryptedSecret = this.decryptSecret(user.totp_secret);

    if (this.verifyToken(decryptedSecret, token)) {
      await this.resetFailedAttempts(userId);
      Logger.info("[TwoFactorService] 2FA verification successful", { userId });
      return { success: true, message: "Verification successful" };
    }

    // Verification failed
    const failResult = await this.incrementFailedAttempts(userId);
    Logger.warn("[TwoFactorService] 2FA verification failed", {
      userId,
      attemptsRemaining: failResult.attemptsRemaining,
    });

    return {
      success: false,
      locked: failResult.locked,
      attemptsRemaining: failResult.attemptsRemaining,
      message: failResult.locked
        ? "Too many failed attempts. Account locked for 15 minutes"
        : `Invalid code. ${failResult.attemptsRemaining} attempts remaining`,
    };
  }

  /**
   * Use a recovery code to bypass 2FA
   */
  static async useRecoveryCode(
    userId: string,
    code: string,
  ): Promise<{ success: boolean; remainingCodes?: number; message: string }> {
    // Add randomized delay to prevent timing attacks
    await this.randomDelay();

    // Check rate limit
    const rateLimitStatus = await this.checkRateLimit(userId);
    if (rateLimitStatus.locked) {
      return {
        success: false,
        message: `Account locked. Try again in ${Math.ceil((rateLimitStatus.remainingTime || 0) / 60)} minutes`,
      };
    }

    const user = await UserRepository.findById(userId);

    if (!user || !user.totp_recovery_codes) {
      return { success: false, message: "No recovery codes found" };
    }

    const hashedCodes: string[] = JSON.parse(user.totp_recovery_codes);
    const matchIndex = await this.verifyRecoveryCode(hashedCodes, code);

    if (matchIndex === -1) {
      const failResult = await this.incrementFailedAttempts(userId);
      return {
        success: false,
        message: failResult.locked
          ? "Too many failed attempts. Account locked for 15 minutes"
          : `Invalid recovery code. ${failResult.attemptsRemaining} attempts remaining`,
      };
    }

    // Remove the used code
    hashedCodes[matchIndex] = "";
    const remainingCodes = hashedCodes.filter((c) => c !== "").length;

    await UserRepository.update(userId, {
      totp_recovery_codes: JSON.stringify(hashedCodes),
      totp_failed_attempts: 0,
      totp_lockout_until: null,
    });

    Logger.info("[TwoFactorService] Recovery code used", {
      userId,
      remainingCodes,
    });

    return {
      success: true,
      remainingCodes,
      message: `Recovery code accepted. ${remainingCodes} codes remaining`,
    };
  }

  /**
   * Disable 2FA for a user
   */
  static async disable(
    userId: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> {
    //, token: string
    const user = await UserRepository.findById(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.totp_secret)
      return {
        success: false,
        message: "Your 2FA secret is invalid, contact system administrator.",
      };

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.pass_hash);
    if (!passwordMatch) {
      return { success: false, message: "Invalid password" };
    }

    await UserRepository.update(userId, {
      totp_secret: null,
      totp_enabled: false,
      totp_recovery_codes: null,
      totp_failed_attempts: 0,
      totp_lockout_until: null,
    });

    Logger.info("[TwoFactorService] 2FA disabled", { userId });

    return { success: true, message: "2FA disabled successfully" };
  }

  /**
   * Check if 2FA is enabled for a user
   */
  static async isEnabled(userId: string): Promise<boolean> {
    const user = await UserRepository.findById(userId);
    return user?.totp_enabled ?? false;
  }
}
