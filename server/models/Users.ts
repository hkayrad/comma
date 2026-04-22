import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "../lib/db/sequelize";
import { Companies } from "./Companies";

export class Users extends Model<InferAttributes<Users>, InferCreationAttributes<Users>> {
	declare id: CreationOptional<string>;
	declare company_id: string;
	declare username: string;
	declare pass_hash: string;
	declare role: CreationOptional<number>;
	declare created_at: CreationOptional<Date>;
	declare created_by: string;
	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date | null>;
	declare deleted_by: CreationOptional<string | null>;
	// 2FA fields
	declare totp_secret: CreationOptional<string | null>;
	declare totp_enabled: CreationOptional<boolean>;
	declare totp_recovery_codes: CreationOptional<string | null>;
	declare totp_failed_attempts: CreationOptional<number>;
	declare totp_lockout_until: CreationOptional<Date | null>;
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
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
		},
		pass_hash: {
			type: DataTypes.CHAR(60),
			allowNull: false,
		},
		role: {
			type: DataTypes.INTEGER({ length: 1 }),
			allowNull: false,
			defaultValue: 0,
		},
		// 2FA fields
		totp_secret: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: null,
		},
		totp_enabled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		totp_recovery_codes: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: null,
		},
		totp_failed_attempts: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		totp_lockout_until: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null,
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
		indexes: [
			{
				name: "idx_company_id",
				fields: ["company_id"],
			},
		],
	},
);
