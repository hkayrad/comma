import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
	dialect: "mariadb",
	host: process.env.DB_URL,
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	dialectOptions: {
		connectTimeout: 30000,
	},
	pool: {
		max: 5,
		min: 1,
		acquire: 30000,
		idle: 10000,
	},
});

export { sequelize };
