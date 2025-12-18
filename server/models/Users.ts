import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../lib/db/sequelize";
import { Companies } from "./Companies";

export class Users extends Model<InferAttributes<Users>, InferCreationAttributes<Users>> {
	declare id: string;
	declare company_id: string;
	declare username: string;
	declare pass_hash: string;
	declare role: number;
	declare created_at: Date;
	declare created_by: string;
	declare updated_at: Date;
	declare deleted_at: Date;
	declare deleted_by: string;
}

Users.init(
	{
		id: {
			primaryKey: true,
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		company_id: {
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			references: {
				model: Companies,
				key: "id",
			},
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		pass_hash: {
			type: DataTypes.CHAR(60),
			allowNull: false,
		},
		role: {
			type: DataTypes.INTEGER({ length: 1 }),
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		created_by: {
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			references: {
				model: Users,
				key: "id",
			},
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		deleted_at: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null,
		},
		deleted_by: {
			type: DataTypes.UUID,
			allowNull: true,
			defaultValue: null,
			references: {
				model: Users,
				key: "id",
			},
		},
	},
	{
		sequelize,
		modelName: "Users",
		tableName: "users",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
	},
);
