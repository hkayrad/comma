import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "../lib/db/sequelize";

export class RefreshTokens extends Model<InferAttributes<RefreshTokens>, InferCreationAttributes<RefreshTokens>> {
	declare id: CreationOptional<string>;
	declare user_id: string;
	declare token_hash: string;
	declare expires_at: Date;
	declare revoked: CreationOptional<boolean>;
	declare created_at: CreationOptional<Date>;
}

RefreshTokens.init(
	{
		id: {
			primaryKey: true,
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		user_id: {
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			references: {
				model: "Users",
				key: "id",
			},
		},
		token_hash: {
			type: DataTypes.CHAR(64),
			allowNull: false,
		},
		expires_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		revoked: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		sequelize,
		modelName: "RefreshTokens",
		tableName: "refresh_tokens",
		createdAt: "created_at",
		updatedAt: false,
	},
);
