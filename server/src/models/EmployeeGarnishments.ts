import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Companies } from "./Companies";
import { Employees } from "./Employees";
import { Users } from "./Users";
import { registerAuditHooks } from "@/lib/db/auditHooks";

export class EmployeeGarnishments extends Model<InferAttributes<EmployeeGarnishments>, InferCreationAttributes<EmployeeGarnishments>> {
	declare id: CreationOptional<string>;
	declare company_id: CreationOptional<string>;
	declare employee_id: string;
	declare file_no: string;
	declare execution_office: string;
	declare total_debt: number;
	declare deduction_type: CreationOptional<string>;
	declare deduction_value: number;
	declare start_date: CreationOptional<string | null>;
	declare paid_amount: CreationOptional<number>;

	declare status: CreationOptional<string>;
	declare notes: CreationOptional<string | null>;
	declare created_at: CreationOptional<Date>;
	declare created_by: CreationOptional<string>;
	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date | null>;
	declare deleted_by: CreationOptional<string | null>;
}

EmployeeGarnishments.init(
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
		file_no: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		execution_office: {
			type: DataTypes.STRING(150),
			allowNull: false,
		},
		total_debt: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
		},
		deduction_type: {
			type: DataTypes.ENUM("PERCENTAGE", "FIXED"),
			allowNull: false,
			defaultValue: "PERCENTAGE",
		},
		deduction_value: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
			defaultValue: 25.00,
		},
		start_date: {
			type: DataTypes.STRING(10),
			allowNull: true,
			defaultValue: null,
		},
		paid_amount: {

			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
			defaultValue: 0.00,
		},
		status: {
			type: DataTypes.ENUM("ACTIVE", "COMPLETED", "PAUSED"),
			allowNull: false,
			defaultValue: "ACTIVE",
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
		modelName: "EmployeeGarnishments",
		tableName: "employee_garnishments",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
		indexes: [
			{
				name: "idx_garnishments_company_id",
				fields: ["company_id"],
			},
			{
				name: "idx_garnishments_employee_id",
				fields: ["employee_id"],
			},
		],
	},
);

EmployeeGarnishments.belongsTo(Employees, { foreignKey: "employee_id", as: "employee" });
Employees.hasMany(EmployeeGarnishments, { foreignKey: "employee_id", as: "garnishments" });

registerAuditHooks(EmployeeGarnishments);
