import mariadb from "mariadb";
import { env } from "@/lib/utils/env";

export const pool = mariadb.createPool({
	host: env.DB_URL,
	user: env.DB_USER,
	password: env.DB_PASSWORD,
	database: env.DB_NAME,
	connectionLimit: 5,
	connectTimeout: 10000,
});
