import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../lib/db/sequelize";

export class Config extends Model<InferAttributes<Config>, InferCreationAttributes<Config>> {
	declare configKey: string;
	declare configValue: string;
}

Config.init(
	{
		configKey: {
			primaryKey: true,
			type: DataTypes.STRING(128),
			allowNull: false,
		},
		configValue: {
			type: DataTypes.STRING(128),
			allowNull: false,
		},
	},
	{
		sequelize,
		modelName: "Config",
		tableName: "config",
		timestamps: false,
	},
);
