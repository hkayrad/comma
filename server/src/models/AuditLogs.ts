import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import type { AuditLogAction } from "@comma/common/types";
import { Companies } from "./Companies";
import { Users } from "./Users";

export class AuditLogs extends Model<InferAttributes<AuditLogs>, InferCreationAttributes<AuditLogs>> {
	declare id: CreationOptional<string>;
	declare company_id: string;
	declare user_id: CreationOptional<string | null>;
	declare entity_type: string;
	declare entity_id: string;
	declare action: AuditLogAction;
	declare old_values: CreationOptional<Record<string, any> | null>;
	declare new_values: CreationOptional<Record<string, any> | null>;
	declare ip_address: CreationOptional<string | null>;
	declare user_agent: CreationOptional<string | null>;
	declare created_at: CreationOptional<Date>;
}

AuditLogs.init(
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
			references: {
				model: Companies,
				key: "id",
			},
		},
		user_id: {
			type: DataTypes.UUID,
			allowNull: true,
			defaultValue: null,
			references: {
				model: Users,
				key: "id",
			},
		},
		entity_type: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		entity_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		action: {
			type: DataTypes.STRING(20),
			allowNull: false,
			validate: {
				isIn: [["CREATE", "UPDATE", "DELETE", "RESTORE"]],
			},
		},
		old_values: {
			type: DataTypes.JSON,
			allowNull: true,
			defaultValue: null,
		},
		new_values: {
			type: DataTypes.JSON,
			allowNull: true,
			defaultValue: null,
		},
		ip_address: {
			type: DataTypes.STRING(45),
			allowNull: true,
			defaultValue: null,
		},
		user_agent: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: null,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		sequelize,
		modelName: "AuditLogs",
		tableName: "audit_logs",
		createdAt: "created_at",
		updatedAt: false,
		indexes: [
			{
				name: "idx_audit_logs_company_id",
				fields: ["company_id"],
			},
			{
				name: "idx_audit_logs_user_id",
				fields: ["user_id"],
			},
			{
				name: "idx_audit_logs_company_entity",
				fields: ["company_id", "entity_type", "entity_id"],
			},
			{
				name: "idx_audit_logs_company_created_at",
				fields: ["company_id", "created_at"],
			},
		],
	},
);

AuditLogs.belongsTo(Companies, { foreignKey: "company_id", as: "company" });
AuditLogs.belongsTo(Users, { foreignKey: "user_id", as: "user" });
