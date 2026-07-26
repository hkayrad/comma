import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Companies } from "./Companies";
import { PayableCustomers } from "./PayableCustomers";
import { Users } from "./Users";
import { registerAuditHooks } from "@/lib/db/auditHooks";

export class PayablePayments extends Model<InferAttributes<PayablePayments>, InferCreationAttributes<PayablePayments>> {
	declare id: CreationOptional<string>;
	declare company_id: CreationOptional<string>;
	declare customer_id: CreationOptional<string>;
	declare amount: number;
	declare currency: CreationOptional<string>;
	declare exchange_rate: CreationOptional<number>;
	declare amount_in_try: CreationOptional<number>;
	declare invoice_no: CreationOptional<string | null>;
	declare payment_date: Date;
	declare description: CreationOptional<string | null>;
	declare payment_method: CreationOptional<"cash" | "card" | "bank_transfer" | "check">;
	declare due_date: CreationOptional<Date | null>;
	declare created_at: CreationOptional<Date>;
	declare created_by: CreationOptional<string>;
	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date>;
	declare deleted_by: CreationOptional<string | null>;
}

PayablePayments.init(
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
				model: PayableCustomers,
				key: "id",
			},
		},

		amount: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
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
		amount_in_try: {
			type: DataTypes.VIRTUAL(DataTypes.DECIMAL(16, 2)),
			allowNull: true,
			get() {
				return this.amount * this.exchange_rate;
			},
		},
		invoice_no: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		payment_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		},
		payment_method: {
			type: DataTypes.ENUM("cash", "card", "bank_transfer", "check"),
			allowNull: false,
			defaultValue: "Cash",
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
		modelName: "PayablePayments",
		tableName: "payable_payments",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
		indexes: [
			{
				name: "idx_payable_payments_company_id",
				fields: ["company_id"],
			},
			{
				name: "idx_payable_payments_customer_id",
				fields: ["customer_id"],
			},
			{
				name: "idx_payable_payments_invoice_no",
				fields: ["invoice_no"],
			},
			{
				name: "idx_payable_payments_payment_date",
				fields: ["payment_date"],
			},
			{
				name: "idx_payable_payments_deleted_at",
				fields: ["deleted_at"],
			},
		],
	},
);

registerAuditHooks(PayablePayments);

