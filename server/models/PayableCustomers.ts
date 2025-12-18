import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "../lib/db/sequelize";
import { Companies } from "./Companies";
import { Users } from "./Users";

export class PayableCustomers extends Model<InferAttributes<PayableCustomers>, InferCreationAttributes<PayableCustomers>> {
	declare id: CreationOptional<string>;
	declare company_id: string;
	declare name: string;
	declare phone: CreationOptional<string | null>;
	declare is_company: boolean;
	declare tax_number: CreationOptional<string | null>;
	declare tax_office: CreationOptional<string | null>;
	declare mersis_no: CreationOptional<string | null>;
	declare email: CreationOptional<string | null>;
	declare address: CreationOptional<string | null>;
	declare created_at: CreationOptional<Date>;
	declare created_by: string;
	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date>;
	declare deleted_by: CreationOptional<string | null>;
}

PayableCustomers.init(
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
		modelName: "PayableCustomers",
		tableName: "payable_customers",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
	},
);
