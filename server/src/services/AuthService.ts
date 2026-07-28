import { Logger } from "@/lib/utils/logger";
import { env } from "@/lib/utils/env";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserRepository } from "@/repositories/UserRepository";
import { sequelize } from "@/lib/db/sequelize";
import { Transaction } from "sequelize";

export class AuthService {
	private static readonly accessTokenExpiresIn = `15m`;
	private static readonly refreshTokenExpiresIn = `${env.JWT_EXPIRES_IN}d`;
	private static readonly MIN_DELAY_MS = 500; // Minimum delay for timing attack prevention
	private static readonly MAX_DELAY_MS = 1500; // Maximum delay for timing attack prevention

	/**
	 * Introduce a random delay to prevent timing attacks
	 */
	private static async randomDelay(): Promise<void> {
		const delay = Math.floor(Math.random() * (this.MAX_DELAY_MS - this.MIN_DELAY_MS + 1)) + this.MIN_DELAY_MS;
		return new Promise((resolve) => setTimeout(resolve, delay));
	}

	private static async recordLoginAudit(params: {
		companyId: string;
		userId: string | null;
		username: string;
		action: "LOGIN_SUCCESS" | "LOGIN_FAILED";
		reason?: string;
		ipAddress?: string | null;
		userAgent?: string | null;
	}) {
		try {
			const { AuditLogService } = await import("@/services/AuditLogService");
			await AuditLogService.recordAction({
				company_id: params.companyId,
				user_id: params.userId,
				entity_type: "Users",
				entity_id: params.userId || "00000000-0000-0000-0000-000000000000",
				action: params.action,
				old_values: null,
				new_values: {
					username: params.username,
					...(params.reason ? { reason: params.reason } : {}),
				},
				ip_address: params.ipAddress || null,
				user_agent: params.userAgent || null,
			});
		} catch (e: any) {
			Logger.warn("[AuthService] Failed to record login audit log", { error: e.message });
		}
	}

	static async Login(username: string, password: string, ipAddress?: string | null, userAgent?: string | null) {
		try {
			// Add randomized delay to prevent timing attacks and brute-force
			await this.randomDelay();

			Logger.info("[AuthService] Login attempt", { username });

			const user = await UserRepository.findByUsername(username);

			if (!user) {
				Logger.error("[AuthService] User not found", { username });
				await this.recordLoginAudit({
					companyId: "00000000-0000-0000-0000-000000000000",
					userId: null,
					username,
					action: "LOGIN_FAILED",
					reason: "User not found",
					ipAddress,
					userAgent,
				});
				return {
					success: false,
					requires2FA: false,
					accessToken: null,
					refreshToken: null,
					tempToken: null,
					message: "Invalid username or password",
					user: null,
				};
			}

			Logger.debug("[AuthService] Verifying password", { username });
			const passwordMatch = await bcrypt.compare(password, user.pass_hash);

			if (!passwordMatch) {
				Logger.error("[AuthService] Invalid password", { username });
				await this.recordLoginAudit({
					companyId: user.company_id,
					userId: user.id,
					username,
					action: "LOGIN_FAILED",
					reason: "Invalid password",
					ipAddress,
					userAgent,
				});
				return {
					success: false,
					requires2FA: false,
					accessToken: null,
					refreshToken: null,
					tempToken: null,
					message: "Invalid username or password",
					user: null,
				};
			}

			// Check if 2FA is enabled (Functionality disabled, code preserved for future use)
			if (false && user.totp_enabled) {
				Logger.info("[AuthService] 2FA required for user", { username, userId: user.id });

				// Generate a temporary token for 2FA verification
				const tempToken = jwt.sign(
					{ id: user.id, purpose: "2fa_verification" },
					env.JWT_SECRET as jwt.Secret,
					{ expiresIn: "5m" }
				);

				return {
					success: true,
					requires2FA: true,
					accessToken: null,
					refreshToken: null,
					tempToken: tempToken,
					message: "2FA verification required",
					user: {
						id: user.id,
						username: user.username,
						role: user.role,
					},
				};
			}

			// No 2FA - proceed with normal login
			Logger.debug("[AuthService] Generating tokens", { userId: user.id, companyId: user.company_id });

			const accessTokenPayload = {
				id: user.id,
				companyId: user.company_id,
				username: user.username,
				role: user.role,
			};

			const accessToken = jwt.sign(accessTokenPayload, env.JWT_SECRET as jwt.Secret, {
				issuer: env.JWT_ISSUER,
				audience: env.JWT_AUDIENCE,
				expiresIn: this.accessTokenExpiresIn as any,
			});

			// Generate opaque refresh token
			const refreshToken = crypto.randomBytes(40).toString("hex");
			const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
			const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

			// Cleanup expired tokens for this user
			try {
				const deletedCount = await UserRepository.deleteExpiredRefreshTokens(user.id);
				Logger.debug("[AuthService] Cleanup expired tokens", {
					userId: user.id,
					deletedCount: deletedCount,
				});
			} catch (cleanupError: any) {
				Logger.warn("[AuthService] Failed to cleanup expired tokens", { error: cleanupError.message });
			}

			await UserRepository.createRefreshToken({
				user_id: user.id,
				token_hash: refreshTokenHash,
				expires_at: expiresAt,
			});

			Logger.info("[AuthService] Login successful", { username, userId: user.id, companyId: user.company_id });

			await this.recordLoginAudit({
				companyId: user.company_id,
				userId: user.id,
				username: user.username,
				action: "LOGIN_SUCCESS",
				ipAddress,
				userAgent,
			});

			return {
				success: true,
				requires2FA: false,
				accessToken: accessToken,
				refreshToken: refreshToken,
				tempToken: null,
				message: "Login successful",
				user: {
					id: user.id,
					username: user.username,
					role: user.role,
				},
			};
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[AuthService] Error during login", { username, error: error.message });
			return {
				success: false,
				requires2FA: false,
				accessToken: null,
				refreshToken: null,
				tempToken: null,
				message: "An error occurred during login",
				user: null,
			};
		}
	}

	/**
	 * Complete login after 2FA verification - issues full tokens
	 */
	static async Complete2FALogin(userId: string, ipAddress?: string | null, userAgent?: string | null) {
		try {
			Logger.info("[AuthService] Completing 2FA login", { userId });

			const user = await UserRepository.findById(userId);

			if (!user) {
				return {
					success: false,
					accessToken: null,
					refreshToken: null,
					message: "User not found",
					user: null,
				};
			}

			const accessTokenPayload = {
				id: user.id,
				companyId: user.company_id,
				username: user.username,
				role: user.role,
			};

			const accessToken = jwt.sign(accessTokenPayload, env.JWT_SECRET as jwt.Secret, {
				issuer: env.JWT_ISSUER,
				audience: env.JWT_AUDIENCE,
				expiresIn: this.accessTokenExpiresIn as any,
			});

			// Generate opaque refresh token
			const refreshToken = crypto.randomBytes(40).toString("hex");
			const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
			const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

			// Cleanup expired tokens
			try {
				await UserRepository.deleteExpiredRefreshTokens(user.id);
			} catch (cleanupError: any) {
				Logger.warn("[AuthService] Failed to cleanup expired tokens", { error: cleanupError.message });
			}

			await UserRepository.createRefreshToken({
				user_id: user.id,
				token_hash: refreshTokenHash,
				expires_at: expiresAt,
			});

			Logger.info("[AuthService] 2FA login completed", { userId, username: user.username });

			await this.recordLoginAudit({
				companyId: user.company_id,
				userId: user.id,
				username: user.username,
				action: "LOGIN_SUCCESS",
				ipAddress,
				userAgent,
			});

			return {
				success: true,
				accessToken: accessToken,
				refreshToken: refreshToken,
				message: "Login successful",
				user: {
					id: user.id,
					username: user.username,
					role: user.role,
				},
			};
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[AuthService] Error completing 2FA login", { userId, error: error.message });
			return {
				success: false,
				accessToken: null,
				refreshToken: null,
				message: "Failed to complete login",
				user: null,
			};
		}
	}

	static async RefreshToken(refreshToken: string) {
		try {
			Logger.info("[AuthService] Refreshing token");
			const requestTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

			return await sequelize.transaction(async (t) => {
				// Find token in DB with locking
				const dbToken = await UserRepository.findRefreshTokenByHash(requestTokenHash, t, Transaction.LOCK.UPDATE);

				if (!dbToken) {
					return {
						success: false,
						message: "Invalid refresh token",
						accessToken: null,
						refreshToken: null,
						user: null,
					};
				}

				// Check if revoked (Reuse Detection)
				if (dbToken.revoked) {
					Logger.warn("[AuthService] Reuse of revoked token detected! Revoking all tokens for user.", { userId: dbToken.user_id });
					await UserRepository.revokeAllRefreshTokens(dbToken.user_id, t);
					return {
						success: false,
						message: "Security alert: Token reuse detected. Re-login required.",
						accessToken: null,
						refreshToken: null,
						user: null,
					};
				}

				// Check expiry
				if (new Date() > dbToken.expires_at) {
					// Optionally delete expired token to clean up
					await dbToken.destroy({ transaction: t });
					return {
						success: false,
						message: "Refresh token expired",
						accessToken: null,
						refreshToken: null,
						user: null,
					};
				}

				// Valid token. Fetch user info.
				Logger.debug("Fetching user for token", { userId: dbToken.user_id });
				const dbUser = await UserRepository.findById(dbToken.user_id, t);

				if (!dbUser) {
					return {
						success: false,
						accessToken: null,
						refreshToken: null,
						message: "User not found",
						user: null,
					};
				}

				// Rotate token: Revoke old, Create new
				dbToken.revoked = true;
				Logger.debug("Saving old token as revoked");
				await dbToken.save({ transaction: t });

				// Generate new Access Token
				const accessTokenPayload = {
					id: dbUser.id,
					companyId: dbUser.company_id,
					username: dbUser.username,
					role: dbUser.role,
				};
				const accessToken = jwt.sign(accessTokenPayload, env.JWT_SECRET as jwt.Secret, {
					issuer: env.JWT_ISSUER,
					audience: env.JWT_AUDIENCE,
					expiresIn: this.accessTokenExpiresIn as any,
				});

				// Generate new Refresh Token
				const newRefreshToken = crypto.randomBytes(40).toString("hex");
				const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
				const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

				Logger.debug("Creating new refresh token");
				await UserRepository.createRefreshToken(
					{
						user_id: dbUser.id,
						token_hash: newRefreshTokenHash,
						expires_at: expiresAt,
					},
					t
				);

				Logger.info("[AuthService] Token refresh successful", {
					username: dbUser.username,
					userId: dbUser.id,
					companyId: dbUser.company_id,
				});

				return {
					success: true,
					accessToken: accessToken,
					refreshToken: newRefreshToken,
					message: "Token refresh successful",
					user: {
						id: dbUser.id,
						username: dbUser.username,
						role: dbUser.role,
					},
				};
			});
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[AuthService] Token refresh failed", { error: error.message });
			return {
				success: false,
				message: "Token refresh failed",
				accessToken: null,
				refreshToken: null,
				user: null,
			};
		}
	}

	static async Logout(refreshToken: string) {
		try {
			const requestTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

			const result = await UserRepository.deleteRefreshToken(requestTokenHash);

			Logger.info("[AuthService] Logout successful (token deleted)", {
				deletedCount: result,
			});
			return true;
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[AuthService] Logout failed", { error: error.message });
			return false;
		}
	}
}
