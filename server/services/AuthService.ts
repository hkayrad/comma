import { pool } from "../lib/db/pool";
import { ApiResponse, Logger } from "../lib/utils/index";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { DecodedJwtToken } from "@common/types";

dotenv.config();

export class AuthService {
	static async VerifyToken(token: string): Promise<DecodedJwtToken | null> {
		try {
			Logger.debug("[AuthService] Verifying token");
			const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret, {
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
			}) as DecodedJwtToken;

			Logger.debug("[AuthService] Token verified successfully", { userId: decoded.id, companyId: decoded.companyId });
			return decoded;
		} catch (error: any) {
			Logger.error("[AuthService] Token verification failed", { error: error.message });
			return null;
		}
	}

	static async Login(username: string, password: string) {
		let conn;

		try {
			Logger.info("[AuthService] Login attempt", { username });

			conn = await pool.getConnection();
			const rows = (await conn.query("SELECT * FROM users WHERE username = ?", [username])) as any[];

			if (rows.length === 0) {
				Logger.error("[AuthService] User not found", { username });
				return ApiResponse.error("Invalid username or password");
			}

			const user = rows[0];

			Logger.debug("[AuthService] Verifying password", { username });
			const passwordMatch = await bcrypt.compare(password, user.pass_hash);

			if (!passwordMatch) {
				Logger.error("[AuthService] Invalid password", { username });
				return ApiResponse.error("Invalid username or password");
			}

			Logger.debug("[AuthService] Generating JWT token", { userId: user.id, companyId: user.company_id });

			const expiresIn = `${process.env.JWT_EXPIRES_IN || 8}h`;

			const payload = {
				id: user.id,
				companyId: user.company_id,
				username: user.username,
				role: user.role,
			};

			const token = jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
				expiresIn: expiresIn as any,
			});

			Logger.info("[AuthService] Login successful", { username, userId: user.id, companyId: user.company_id });

			return ApiResponse.success(token, "Login successful");
		} catch (error: any) {
			Logger.error("[AuthService] Error during login", { username, error: error.message });
			return ApiResponse.error("An error occurred during login");
		} finally {
			if (conn) conn.release();
		}
	}
}
