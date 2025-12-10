import { pool } from "../lib/db/pool";
import { Logger } from "../lib/utils/index";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import crypto from "crypto";
import { PoolConnection } from "mariadb";

dotenv.config();

export class AuthService {
	private static readonly accessTokenExpiresIn = `15m`;
	private static readonly refreshTokenExpiresIn = `${process.env.JWT_EXPIRES_IN || 7}d`;

	static async Login(username: string, password: string) {
		let conn;

		try {
			Logger.info("[AuthService] Login attempt", { username });

			conn = await pool.getConnection();
			const rows = (await conn.query("SELECT * FROM users WHERE username = ?", [username])) as any[];

			if (rows.length === 0) {
				Logger.error("[AuthService] User not found", { username });
				return {
					success: false,
					accessToken: null,
					refreshToken: null,
					message: "Invalid username or password",
					user: null,
				};
			}

			const user = rows[0];

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
				const cleanupResult = await conn.query("DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at < ?", [
					user.id,
					new Date(),
				]);
				Logger.debug("[AuthService] Cleanup expired tokens", {
					userId: user.id,
					deletedCount: (cleanupResult as any).affectedRows,
				});
			} catch (cleanupError: any) {
				Logger.warn("[AuthService] Failed to cleanup expired tokens", { error: cleanupError.message });
			}

			await conn.query(
				"INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
				[user.id, refreshTokenHash, expiresAt]
			);

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
		} finally {
			if (conn) conn.release();
		}
	}

	static async RefreshToken(refreshToken: string) {
		let conn: PoolConnection | undefined;

		try {
			Logger.info("[AuthService] Refreshing token");
			const requestTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

			conn = await pool.getConnection();
			await conn.beginTransaction();

			// Find token in DB with locking
			const rows = (await conn.query("SELECT * FROM refresh_tokens WHERE token_hash = ? FOR UPDATE", [requestTokenHash])) as any[];

			if (rows.length === 0) {
				await conn.commit(); // Nothing found, safe to commit empty transaction
				return {
					success: false,
					message: "Invalid refresh token",
					accessToken: null,
					refreshToken: null,
					user: null,
				};
			}

			const dbToken = rows[0];

			// Check if revoked (Reuse Detection)
			if (dbToken.revoked) {
				Logger.warn("[AuthService] Reuse of revoked token detected! Revoking all tokens for user.", { userId: dbToken.user_id });
				await conn.query("UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?", [dbToken.user_id]);
				await conn.commit();
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
				await conn.query("DELETE FROM refresh_tokens WHERE id = ?", [dbToken.id]);
				await conn.commit();
				return {
					success: false,
					message: "Refresh token expired",
					accessToken: null,
					refreshToken: null,
					user: null,
				};
			}

			// Valid token. Fetch user info.
			const userRows = (await conn.query("SELECT * FROM users WHERE id = ?", [dbToken.user_id])) as any[];
			const dbUser = userRows[0];

			if (!dbUser) {
				await conn.rollback();
				return {
					success: false,
					accessToken: null,
					refreshToken: null,
					message: "User not found",
					user: null,
				};
			}

			// Rotate token: Revoke old, Create new
			await conn.query("UPDATE refresh_tokens SET revoked = 1 WHERE id = ?", [dbToken.id]);

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

			await conn.query(
				"INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
				[dbUser.id, newRefreshTokenHash, expiresAt]
			);

			await conn.commit();

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
		} catch (error: any) {
			if (conn) await conn.rollback();
			Logger.error("[AuthService] Token refresh failed", { error: error.message });
			return {
				success: false,
				message: "Token refresh failed",
				accessToken: null,
				refreshToken: null,
				user: null,
			};
		} finally {
			if (conn) await conn?.release();
		}
	}

	static async Logout(refreshToken: string) {
		let conn;
		try {
			const requestTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
			conn = await pool.getConnection();

			const result = await conn.query("DELETE FROM refresh_tokens WHERE token_hash = ?", [requestTokenHash]);
			Logger.info("[AuthService] Logout successful (token deleted)", {
				deletedCount: (result as any).affectedRows,
			});
			return true;
		} catch (error: any) {
			Logger.error("[AuthService] Logout failed", { error: error.message });
			return false;
		} finally {
			if (conn) conn.release();
		}
	}
}
