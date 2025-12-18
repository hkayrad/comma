import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "../lib/db/sequelize";
import { UUID } from "../lib/types";

export class Companies extends Model<InferAttributes<Companies>, InferCreationAttributes<Companies>> {
	declare id: CreationOptional<UUID>;
	declare name: string;
	declare phone: string | null;
	declare is_company: boolean;
	declare tax_number: string | null;
	declare tax_office: string | null;
	declare mersis_no: string | null;
	declare email: string | null;
	declare address: string | null;
	declare small_logo_path: string | null;
	declare large_logo_path: string | null;
	declare created_at: CreationOptional<Date>;
	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date | null>;
}

Companies.init(
	{
		id: {
			primaryKey: true,
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		name: {
			type: DataTypes.CHAR(255),
			allowNull: false,
		},
		phone: {
			type: DataTypes.CHAR(20),
			allowNull: true,
			defaultValue: null,
		},
		is_company: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		tax_number: {
			type: DataTypes.CHAR(11),
			allowNull: true,
			defaultValue: null,
		},
		tax_office: {
			type: DataTypes.CHAR(255),
			allowNull: true,
			defaultValue: null,
		},
		mersis_no: {
			type: DataTypes.CHAR(16),
			allowNull: true,
			defaultValue: null,
		},
		email: {
			type: DataTypes.CHAR(255),
			allowNull: true,
			defaultValue: null,
		},
		address: {
			type: DataTypes.CHAR(255),
			allowNull: true,
			defaultValue: null,
		},
		small_logo_path: {
			type: DataTypes.STRING(1024),
			allowNull: true,
			defaultValue: null,
		},
		large_logo_path: {
			type: DataTypes.STRING(1024),
			allowNull: true,
			defaultValue: null,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
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
	},
	{
		sequelize,
		modelName: "Companies",
		tableName: "companies",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
	},
);
