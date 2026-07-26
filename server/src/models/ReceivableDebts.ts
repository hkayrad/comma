import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Companies } from "./Companies";
import { ReceivableCustomers } from "./ReceivableCustomers";
import { Users } from "./Users";
import { registerAuditHooks } from "@/lib/db/auditHooks";

export class ReceivableDebts extends Model<InferAttributes<ReceivableDebts>, InferCreationAttributes<ReceivableDebts>> {
	declare id: CreationOptional<string>;
	declare company_id: CreationOptional<string>;
	declare customer_id: CreationOptional<string>;
	declare invoice_no: CreationOptional<string | null>;
	declare amount: number;
	declare discount: CreationOptional<number>;
	declare vat: number;
	declare withholding: CreationOptional<number>;
	declare currency: CreationOptional<string>;
	declare exchange_rate: CreationOptional<number>;
	declare total: CreationOptional<number>;
	declare total_in_try: CreationOptional<number>;
	declare description: CreationOptional<string | null>;
	declare issue_date: Date;
	declare due_date: CreationOptional<Date | null>;
	declare created_at: CreationOptional<Date>;
	declare created_by: CreationOptional<string>;
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
				model: Companies,
				key: "id",
			},
		},
		customer_id: {
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			references: {
				model: ReceivableCustomers,
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
		discount: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: true,
			defaultValue: 0.0,
		},
		vat: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
		},
		withholding: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: true,
			defaultValue: 0.0,
		},
		currency: {
			type: DataTypes.STRING(3),
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
			allowNull: true,
			get() {
				const amount = Number(this.getDataValue("amount") || 0);
				const vat = Number(this.getDataValue("vat") || 0);
				const discount = Number(this.getDataValue("discount") || 0);
				const withholding = Number(this.getDataValue("withholding") || 0);
				return amount + vat - discount - withholding;
			},
		},
		total_in_try: {
			type: DataTypes.VIRTUAL(DataTypes.DECIMAL(16, 2)),
			allowNull: true,
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
		due_date: {
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
		modelName: "ReceivableDebts",
		tableName: "receivable_debts",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
		indexes: [
			{
				name: "idx_receivable_debts_company_id",
				fields: ["company_id"],
			},
			{
				name: "idx_receivable_debts_customer_id",
				fields: ["customer_id"],
			},
			{
				name: "idx_receivable_debts_issue_date",
				fields: ["issue_date"],
			},
			{
				name: "idx_receivable_debts_due_date",
				fields: ["due_date"],
			},
			{
				name: "idx_receivable_debts_invoice_no",
				fields: ["invoice_no"],
			},
			{
				name: "idx_receivable_debts_deleted_at",
				fields: ["deleted_at"],
			},
		],
	},
);

registerAuditHooks(ReceivableDebts);

