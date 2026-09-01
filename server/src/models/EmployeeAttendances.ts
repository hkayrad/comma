import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Companies } from "./Companies";
import { Employees } from "./Employees";
import { Users } from "./Users";
import { registerAuditHooks } from "@/lib/db/auditHooks";

export class EmployeeAttendances extends Model<InferAttributes<EmployeeAttendances>, InferCreationAttributes<EmployeeAttendances>> {
	declare id: CreationOptional<string>;
	declare company_id: CreationOptional<string>;
	declare employee_id: string;
	declare date: Date;
	declare check_in_time: CreationOptional<string | null>;
	declare check_out_time: CreationOptional<string | null>;
	declare status: CreationOptional<string>;
	declare overtime_hours: CreationOptional<number>;
	declare overtime_multiplier: CreationOptional<number>;
	declare notes: CreationOptional<string | null>;
	declare created_at: CreationOptional<Date>;
	declare created_by: CreationOptional<string>;
	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date | null>;
	declare deleted_by: CreationOptional<string | null>;
}

EmployeeAttendances.init(
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
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		check_in_time: {
			type: DataTypes.STRING(10),
			allowNull: true,
			defaultValue: null,
		},
		check_out_time: {
			type: DataTypes.STRING(10),
			allowNull: true,
			defaultValue: null,
		},
		status: {
			type: DataTypes.ENUM(
				"PRESENT",
				"ABSENT_UNEXCUSED",
				"ABSENT_EXCUSED",
				"ANNUAL_LEAVE",
				"SICK_LEAVE",
				"UNPAID_LEAVE",
				"HALF_DAY",
			),
			allowNull: false,
			defaultValue: "PRESENT",
		},
		overtime_hours: {
			type: DataTypes.DECIMAL(5, 2),
			allowNull: false,
			defaultValue: 0.00,
		},
		overtime_multiplier: {
			type: DataTypes.DECIMAL(4, 2),
			allowNull: false,
			defaultValue: 1.50,
		},
		notes: {
			type: DataTypes.STRING(500),
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
		modelName: "EmployeeAttendances",
		tableName: "employee_attendances",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
		indexes: [
			{
				name: "idx_attendances_company_id",
				fields: ["company_id"],
			},
			{
				name: "idx_attendances_employee_id",
				fields: ["employee_id"],
			},
			{
				name: "idx_attendances_date",
				fields: ["date"],
			},
		],
	},
);

EmployeeAttendances.belongsTo(Employees, { foreignKey: "employee_id", as: "employee" });
Employees.hasMany(EmployeeAttendances, { foreignKey: "employee_id", as: "attendances" });

registerAuditHooks(EmployeeAttendances);
