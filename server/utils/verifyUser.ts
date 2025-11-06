import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

export default function verifyUser(token: string): any | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        });
        return decoded;
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
}