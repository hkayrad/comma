import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { UUID } from "@comma/common/types";
import { registerAuditHooks } from "@/lib/db/auditHooks";

export class Companies extends Model<InferAttributes<Companies>, InferCreationAttributes<Companies>> {
	declare id: CreationOptional<UUID>;
	declare name: string;
	declare phone: CreationOptional<string | null>;
	declare is_company: CreationOptional<boolean>;
	declare tax_number: CreationOptional<string | null>;
	declare tax_office: CreationOptional<string | null>;
	declare mersis_no: CreationOptional<string | null>;
	declare email: CreationOptional<string | null>;
	declare address: CreationOptional<string | null>;
	declare small_logo_path: CreationOptional<string | null>;
	declare large_logo_path: CreationOptional<string | null>;
	declare work_start_time: CreationOptional<string | null>;
	declare work_end_time: CreationOptional<string | null>;
	declare created_at: CreationOptional<Date>;

	declare updated_at: CreationOptional<Date>;
	declare deleted_at: CreationOptional<Date | null>;
}

Companies.init(
	{
		id: {
			primaryKey: true,
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		phone: {
			type: DataTypes.STRING(20),
			allowNull: true,
			defaultValue: null,
		},
		is_company: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		tax_number: {
			type: DataTypes.STRING(11),
			allowNull: true,
			defaultValue: null,
		},
		tax_office: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: null,
		},
		mersis_no: {
			type: DataTypes.STRING(16),
			allowNull: true,
			defaultValue: null,
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: null,
		},
		address: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: null,
		},
		small_logo_path: {
			type: DataTypes.STRING(1024),
			allowNull: true,
			defaultValue: null,
		},
		large_logo_path: {
			type: DataTypes.STRING(1024),
			allowNull: true,
			defaultValue: null,
		},
		work_start_time: {
			type: DataTypes.STRING(10),
			allowNull: true,
			defaultValue: "08:30",
		},
		work_end_time: {
			type: DataTypes.STRING(10),
			allowNull: true,
			defaultValue: "18:00",
		},
		created_at: {

			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
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
	},
	{
		sequelize,
		modelName: "Companies",
		tableName: "companies",
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		paranoid: true,
	},
);

registerAuditHooks(Companies);

