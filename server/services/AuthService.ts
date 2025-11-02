import { pool } from "../utils/db/pool";
import { ApiResponse, Logger } from "../utils/index";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

export class AuthService {
    static async VerifyToken(token: string) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret, {
                issuer: process.env.JWT_ISSUER,
                audience: process.env.JWT_AUDIENCE
            });
            Logger.log("Token verified:", decoded);
            return decoded;
        } catch (err) {
            Logger.error(err);
            return null;
        }
    }

    static async Login(username: string, password: string) {
        let conn;

        try {
            conn = await pool.getConnection();
            const rows = await conn.query("SELECT * FROM users WHERE username = ?", [username]);

            if (rows.length === 0)
                return ApiResponse.error("Invalid username or password");

            const user = rows[0];

            const passwordMatch = await bcrypt.compare(password, user.pass_hash);

            if (!passwordMatch)
                return ApiResponse.error("Invalid username or password");

            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET as jwt.Secret,
                {
                    issuer: process.env.JWT_ISSUER,
                    audience: process.env.JWT_AUDIENCE,
                    expiresIn: `${process.env.JWT_EXPIRES_IN}h` as any
                }
            )

            return ApiResponse.success(token, "Login successful");

        } catch (err) {
            Logger.error(err);
            return ApiResponse.error("An error occurred during login");
        } finally {
            if (conn) conn.release();
        }
    }
}