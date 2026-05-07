import { cleanEnv, str, port, num, url } from "envalid";
import dotenv from "dotenv";

dotenv.config();

export const env = cleanEnv(process.env, {
	NODE_ENV: str({ choices: ["development", "test", "production"], default: "development" }),
	SERVER_PORT: port({ default: 3001 }),
	CLIENT_URL: url(),
	DB_HOST: str({ default: "localhost" }),
	DB_PORT: port({ default: 3306 }),
	DB_USER: str(),
	DB_PASSWORD: str(),
	DB_NAME: str({ default: "comma" }),
	DB_URL: str(),
	JWT_SECRET: str(),
	JWT_EXPIRES_IN: str({ default: "7" }),
	JWT_ISSUER: str({ default: "comma" }),
	JWT_AUDIENCE: str({ default: "comma-users" }),
	TCMB_API_KEY: str({ default: "" }),
	PROXY_URL: url({ default: "https://proxy.hkayrad.me" }),
	PROXY_API_KEY: str({ default: "" }),
	TOTP_ENCRYPTION_KEY: str(),
	APP_NAME: str({ default: "Comma" }),
});
