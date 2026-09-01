import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Companies } from "./Companies";
import { Employees } from "./Employees";
import { Users } from "./Users";
import { registerAuditHooks } from "@/lib/db/auditHooks";

export class EmployeePayrolls extends Model<InferAttributes<EmployeePayrolls>, InferCreationAttributes<EmployeePayrolls>> {
	declare id: CreationOptional<string>;
	declare company_id: CreationOptional<string>;
	declare employee_id: string;
	declare period_year: number;
	declare period_month: number;
	declare base_salary: number;
	declare working_days: CreationOptional<number>;
	declare absent_days: CreationOptional<number>;
	declare absence_deduction: CreationOptional<number>;
	declare overtime_pay: CreationOptional<number>;
	declare bonus_pay: CreationOptional<number>;
	declare advance_deduction: CreationOptional<number>;
	declare garnishment_deduction: CreationOptional<number>;
	declare net_payable: number;
	declare payment_status: CreationOptional<string>;
	declare payment_date: CreationOptional<Date | null>;
	declare created_at: CreationOptional<Date>;
	declare created_by: CreationOptional<string>;
	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date | null>;
	declare deleted_by: CreationOptional<string | null>;
}

EmployeePayrolls.init(
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
		employee_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: Employees,
				key: "id",
			},
		},
		period_year: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		period_month: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		base_salary: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
		},
		working_days: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 30,
		},
		absent_days: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		absence_deduction: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
			defaultValue: 0.00,
		},
		overtime_pay: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
			defaultValue: 0.00,
		},
		bonus_pay: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
			defaultValue: 0.00,
		},
		advance_deduction: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
			defaultValue: 0.00,
		},
		garnishment_deduction: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
			defaultValue: 0.00,
		},
		net_payable: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
		},
		payment_status: {
			type: DataTypes.ENUM("DRAFT", "APPROVED", "PAID"),
			allowNull: false,
			defaultValue: "DRAFT",
		},
		payment_date: {
			type: DataTypes.DATEONLY,
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
		modelName: "EmployeePayrolls",
		tableName: "employee_payrolls",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
		indexes: [
			{
				name: "idx_payrolls_company_id",
				fields: ["company_id"],
			},
			{
				name: "idx_payrolls_employee_id",
				fields: ["employee_id"],
			},
			{
				name: "idx_payrolls_period",
				fields: ["period_year", "period_month"],
			},
		],
	},
);

EmployeePayrolls.belongsTo(Employees, { foreignKey: "employee_id", as: "employee" });
Employees.hasMany(EmployeePayrolls, { foreignKey: "employee_id", as: "payrolls" });

registerAuditHooks(EmployeePayrolls);
