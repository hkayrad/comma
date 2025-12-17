import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "../lib/db/sequelize";

export class ReceivableDebts extends Model<InferAttributes<ReceivableDebts>, InferCreationAttributes<ReceivableDebts>> {
	declare id: CreationOptional<string>;
	declare company_id: string;
	declare customer_id: string;
	declare invoice_no: CreationOptional<string | null>;
	declare amount: number;
	declare vat: number;
	declare currency: string;
	declare exchange_rate: number;
	declare total: CreationOptional<number>;
	declare total_in_try: CreationOptional<number>;
	declare description: CreationOptional<string | null>;
	declare issue_date: Date;
	declare created_at: CreationOptional<Date>;
	declare created_by: string;
	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date>;
	declare deleted_by: CreationOptional<string | null>;
}

ReceivableDebts.init(
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
				model: "Companies",
				key: "id",
			},
		},
		customer_id: {
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			references: {
				model: "ReceivableCustomers",
				key: "id",
			},
		},
		invoice_no: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		amount: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
		},
		vat: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
		},
		currency: {
			type: DataTypes.CHAR(3),
			allowNull: false,
			defaultValue: "TRY",
		},
		exchange_rate: {
			type: DataTypes.DECIMAL(8, 4),
			allowNull: false,
			defaultValue: 1.0,
		},
		total: {
			type: DataTypes.VIRTUAL(DataTypes.DECIMAL(16, 2)),
			allowNull: false,
			get() {
				return this.amount + this.vat;
			},
		},
		total_in_try: {
			type: DataTypes.VIRTUAL(DataTypes.DECIMAL(16, 2)),
			allowNull: false,
			get() {
				return this.total * this.exchange_rate;
			},
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		},
		issue_date: {
			type: DataTypes.DATE,
			allowNull: false,
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
				model: "Users",
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
				model: "Users",
				key: "id",
			},
		},
	},
	{
		sequelize,
		modelName: "ReceivableDebts",
		tableName: "receivable_debts",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
	},
);
