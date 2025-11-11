import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

export const pool = mariadb.createPool({
	host: process.env.DB_URL,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectionLimit: 5,
});
