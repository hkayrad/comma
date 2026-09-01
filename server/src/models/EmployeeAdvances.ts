import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Companies } from "./Companies";
import { Employees } from "./Employees";
import { Users } from "./Users";
import { registerAuditHooks } from "@/lib/db/auditHooks";

export class EmployeeAdvances extends Model<InferAttributes<EmployeeAdvances>, InferCreationAttributes<EmployeeAdvances>> {
	declare id: CreationOptional<string>;
	declare company_id: CreationOptional<string>;
	declare employee_id: string;
	declare amount: number;
	declare request_date: Date;
	declare payment_date: CreationOptional<Date | null>;
	declare status: CreationOptional<string>;
	declare description: CreationOptional<string | null>;
	declare created_at: CreationOptional<Date>;
	declare created_by: CreationOptional<string>;
	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date | null>;
	declare deleted_by: CreationOptional<string | null>;
}

EmployeeAdvances.init(
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
		amount: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
		},
		request_date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		payment_date: {
			type: DataTypes.DATEONLY,
			allowNull: true,
			defaultValue: null,
		},
		status: {
			type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "DEDUCTED"),
			allowNull: false,
			defaultValue: "APPROVED",
		},
		description: {
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
		modelName: "EmployeeAdvances",
		tableName: "employee_advances",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
		indexes: [
			{
				name: "idx_advances_company_id",
				fields: ["company_id"],
			},
			{
				name: "idx_advances_employee_id",
				fields: ["employee_id"],
			},
		],
	},
);

EmployeeAdvances.belongsTo(Employees, { foreignKey: "employee_id", as: "employee" });
Employees.hasMany(EmployeeAdvances, { foreignKey: "employee_id", as: "advances" });

registerAuditHooks(EmployeeAdvances);
