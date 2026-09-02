import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Companies } from "./Companies";
import { Users } from "./Users";
import { registerAuditHooks } from "@/lib/db/auditHooks";

export class Employees extends Model<InferAttributes<Employees>, InferCreationAttributes<Employees>> {
	declare id: CreationOptional<string>;
	declare company_id: CreationOptional<string>;
	declare tc_no: CreationOptional<string | null>;
	declare first_name: string;
	declare last_name: string;
	declare title: CreationOptional<string | null>;
	declare department: CreationOptional<string | null>;
	declare phone: CreationOptional<string | null>;
	declare email: CreationOptional<string | null>;
	declare address: CreationOptional<string | null>;
	declare hire_date: Date;
	declare termination_date: CreationOptional<Date | null>;
	declare iban: CreationOptional<string | null>;
	declare bank_name: CreationOptional<string | null>;
	declare base_salary: number;
	declare cash_salary: CreationOptional<number>;
	declare salary_currency: CreationOptional<string>;
	declare created_at: CreationOptional<Date>;
	declare created_by: CreationOptional<string>;
	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date | null>;
	declare deleted_by: CreationOptional<string | null>;
}

Employees.init(
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
		tc_no: {
			type: DataTypes.STRING(11),
			allowNull: true,
			defaultValue: null,
		},
		first_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		last_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultValue: null,
		},
		department: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultValue: null,
		},
		phone: {
			type: DataTypes.STRING(20),
			allowNull: true,
			defaultValue: null,
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: null,
		},
		address: {
			type: DataTypes.STRING(500),
			allowNull: true,
			defaultValue: null,
		},
		hire_date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		termination_date: {
			type: DataTypes.DATEONLY,
			allowNull: true,
			defaultValue: null,
		},
		iban: {
			type: DataTypes.STRING(34),
			allowNull: true,
			defaultValue: null,
		},
		bank_name: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultValue: null,
		},
		base_salary: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
			defaultValue: 0.00,
		},
		cash_salary: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
			defaultValue: 0.00,
		},
		salary_currency: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: "TRY",
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
		modelName: "Employees",
		tableName: "employees",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
		indexes: [
			{
				name: "idx_employees_company_id",
				fields: ["company_id"],
			},
		],
	},
);

registerAuditHooks(Employees);
