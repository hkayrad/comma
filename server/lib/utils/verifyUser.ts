import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { DecodedJwtToken } from "@common/types";

dotenv.config();

export default function verifyUser(token: string): DecodedJwtToken | null {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret, {
			issuer: process.env.JWT_ISSUER,
			audience: process.env.JWT_AUDIENCE,
		});
		return decoded as DecodedJwtToken;
	} catch (error) {
		console.error("JWT verification failed:", error);
		return null;
	}
}
