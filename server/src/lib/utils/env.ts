import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
	dotenv.config({ path: path.resolve(process.cwd(), ".env.test"), override: true });
} else {
	dotenv.config();
}

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	SERVER_PORT: z.coerce.number().default(3001),
	CLIENT_URL: z.string().url(),
	DB_HOST: z.string().default("localhost"),
	DB_PORT: z.coerce.number().default(3306),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string().default("comma"),
	DB_URL: z.string(),
	JWT_SECRET: z.string(),
	JWT_EXPIRES_IN: z.string().default("7"),
	JWT_ISSUER: z.string().default("comma"),
	JWT_AUDIENCE: z.string().default("comma-users"),
	TCMB_API_KEY: z.string().default(""),
	PROXY_URL: z.string().url().default("https://proxy.hkayrad.me"),
	PROXY_API_KEY: z.string().default(""),
	TOTP_ENCRYPTION_KEY: z.string(),
	APP_NAME: z.string().default("Comma"),
});

const parsed = envSchema.parse(process.env);

export const env = {
	...parsed,
	isProduction: parsed.NODE_ENV === "production",
	isDevelopment: parsed.NODE_ENV === "development",
	isTest: parsed.NODE_ENV === "test",
};
