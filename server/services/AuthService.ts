import { pool } from "../lib/db/pool";
import { Logger } from "../lib/utils/index";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PoolConnection } from "mariadb/*";

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

			Logger.debug("[AuthService] Generating JWT token", { userId: user.id, companyId: user.company_id });

			const accessTokenPayload = {
				id: user.id,
				companyId: user.company_id,
				username: user.username,
				role: user.role,
			};

			const refreshTokenPayload = {
				id: user.id,
			};

			const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET as jwt.Secret, {
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
				expiresIn: this.accessTokenExpiresIn as any,
			});

			const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_SECRET as jwt.Secret, {
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
				expiresIn: this.refreshTokenExpiresIn as any,
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
		} finally {
			if (conn) conn.release();
		}
	}

	static async RefreshToken(refreshToken: string) {
		let conn: PoolConnection | undefined;

		try {
			Logger.info("[AuthService] Refreshing token", { refreshToken });

			const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as jwt.Secret, {
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
			}) as any;

			conn = await pool.getConnection();
			const rows = (await conn.query("SELECT * FROM users WHERE id = ?", [decoded.id])) as any[];

			const dbUser = rows[0];

			if (!dbUser) {
				return {
					success: false,
					accessToken: null,
					refreshToken: null,
					message: "User not found",
					user: null,
				};
			}

			const accessTokenPayload = {
				id: dbUser.id,
				companyId: dbUser.company_id,
				username: dbUser.username,
				role: dbUser.role,
			};
			const refreshTokenPayload = {
				id: dbUser.id,
			};

			const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET as jwt.Secret, {
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
				expiresIn: this.accessTokenExpiresIn as any,
			});

			const newRefreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_SECRET as jwt.Secret, {
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
				expiresIn: this.refreshTokenExpiresIn as any,
			});

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
			Logger.error("[AuthService] Token refresh failed", { error: error.message });
			return {
				success: false,
				message: "Invalid or expired refresh token",
				accessToken: null,
				refreshToken: null,
				user: null,
			};
		} finally {
			if (conn) await conn?.release();
		}
	}
}
