import { Logger } from "../lib/utils/logger";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Users, RefreshTokens } from "../models";
import { sequelize } from "../lib/db/sequelize";
import { Transaction, Op } from "sequelize";

dotenv.config();

export class AuthService {
	private static readonly accessTokenExpiresIn = `15m`;
	private static readonly refreshTokenExpiresIn = `${process.env.JWT_EXPIRES_IN || 7}d`;

	static async Login(username: string, password: string) {
		try {
			Logger.info("[AuthService] Login attempt", { username });

			const user = await Users.findOne({ where: { username } });

			if (!user) {
				Logger.error("[AuthService] User not found", { username });
				return {
					success: false,
					accessToken: null,
					refreshToken: null,
					message: "Invalid username or password",
					user: null,
				};
			}

			Logger.debug("[AuthService] Verifying password", { username });
			const passwordMatch = await bcrypt.compare(password, user.pass_hash);

			if (!passwordMatch) {
				Logger.error("[AuthService] Invalid password", { username });
				return {
					success: false,
					accessToken: null,
					refreshToken: null,
					message: "Invalid username or password",
					user: null,
				};
			}

			Logger.debug("[AuthService] Generating tokens", { userId: user.id, companyId: user.company_id });

			const accessTokenPayload = {
				id: user.id,
				companyId: user.company_id,
				username: user.username,
				role: user.role,
			};

			const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET as jwt.Secret, {
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
				expiresIn: this.accessTokenExpiresIn as any,
			});

			// Generate opaque refresh token
			const refreshToken = crypto.randomBytes(40).toString("hex");
			const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
			const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

			// Cleanup expired tokens for this user
			try {
				const deletedCount = await RefreshTokens.destroy({
					where: {
						user_id: user.id,
						expires_at: { [Op.lt]: new Date() },
					},
				});
				Logger.debug("[AuthService] Cleanup expired tokens", {
					userId: user.id,
					deletedCount: deletedCount,
				});
			} catch (cleanupError: any) {
				Logger.warn("[AuthService] Failed to cleanup expired tokens", { error: cleanupError.message });
			}

			await RefreshTokens.create({
				user_id: user.id,
				token_hash: refreshTokenHash,
				expires_at: expiresAt,
			});

			Logger.info("[AuthService] Login successful", { username, userId: user.id, companyId: user.company_id });

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
		} catch (error: any) {
			Logger.error("[AuthService] Error during login", { username, error: error.message });
			return {
				success: false,
				accessToken: null,
				refreshToken: null,
				message: "An error occurred during login",
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
				const dbToken = await RefreshTokens.findOne({
					where: { token_hash: requestTokenHash },
					lock: Transaction.LOCK.UPDATE,
					transaction: t,
				});

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
					await RefreshTokens.update({ revoked: true }, { where: { user_id: dbToken.user_id }, transaction: t });
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
				const dbUser = await Users.findByPk(dbToken.user_id, { transaction: t });

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
				const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET as jwt.Secret, {
					issuer: process.env.JWT_ISSUER,
					audience: process.env.JWT_AUDIENCE,
					expiresIn: this.accessTokenExpiresIn as any,
				});

				// Generate new Refresh Token
				const newRefreshToken = crypto.randomBytes(40).toString("hex");
				const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
				const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

				Logger.debug("Creating new refresh token");
				await RefreshTokens.create(
					{
						user_id: dbUser.id,
						token_hash: newRefreshTokenHash,
						expires_at: expiresAt,
					},
					{ transaction: t }
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
		} catch (error: any) {
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

			const result = await RefreshTokens.destroy({
				where: { token_hash: requestTokenHash },
			});

			Logger.info("[AuthService] Logout successful (token deleted)", {
				deletedCount: result,
			});
			return true;
		} catch (error: any) {
			Logger.error("[AuthService] Logout failed", { error: error.message });
			return false;
		}
	}
}
