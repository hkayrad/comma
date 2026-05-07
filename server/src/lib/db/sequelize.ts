import { Sequelize } from "sequelize";
import { env } from "@/lib/utils/env";

const sequelize = new Sequelize({
	dialect: "mariadb",
	host: env.DB_URL,
	username: env.DB_USER,
	password: env.DB_PASSWORD,
	database: env.DB_NAME,
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
