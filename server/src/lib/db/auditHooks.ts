import { ModelStatic, Model } from "sequelize";

function extractContext(options: any, instance: any, action: string) {
	const userId =
		options?.user_id ||
		options?.userId ||
		options?.user?.id ||
		options?.context?.user_id ||
		options?.context?.userId ||
		options?.context?.user?.id ||
		(action === "DELETE" ? instance?.deleted_by : null) ||
		(action === "CREATE" ? instance?.created_by : null) ||
		null;

	const ipAddress =
		options?.ip_address ||
		options?.ipAddress ||
		options?.ip ||
		options?.context?.ip_address ||
		options?.context?.ipAddress ||
		options?.context?.ip ||
		null;

	const userAgent =
		options?.user_agent ||
		options?.userAgent ||
		options?.context?.user_agent ||
		options?.context?.userAgent ||
		null;

	return { userId, ipAddress, userAgent };
}

export function registerAuditHooks<T extends Model>(model: ModelStatic<T>, modelName?: string): void {
	const name = modelName || model.name;

	model.addHook("afterCreate", "auditLogAfterCreate", async (instance: T, options: any) => {
		if (options?.skipAudit || options?.hooks === false) return;

		const { AuditLogService } = await import("@/services/AuditLogService");
		const companyId = name === "Companies" ? (instance as any).id : ((instance as any).company_id || (instance as any).id);
		const { userId, ipAddress, userAgent } = extractContext(options, instance, "CREATE");

		const newValues = instance.dataValues ? { ...instance.dataValues } : (instance.toJSON ? instance.toJSON() : null);

		await AuditLogService.recordAction(
			{
				company_id: companyId,
				user_id: userId,
				entity_type: name,
				entity_id: (instance as any).id,
				action: "CREATE",
				old_values: null,
				new_values: newValues,
				ip_address: ipAddress,
				user_agent: userAgent,
			},
			options?.transaction
		);
	});

	model.addHook("afterUpdate", "auditLogAfterUpdate", async (instance: T, options: any) => {
		if (options?.skipAudit || options?.hooks === false) return;

		const { AuditLogService } = await import("@/services/AuditLogService");
		const companyId = name === "Companies" ? (instance as any).id : ((instance as any).company_id || (instance as any).id);
		const { userId, ipAddress, userAgent } = extractContext(options, instance, "UPDATE");

		const changed = instance.changed();
		let oldValues: Record<string, any> | null = null;
		let newValues: Record<string, any> | null = null;

		if (Array.isArray(changed) && changed.length > 0) {
			oldValues = {};
			newValues = {};
			for (const attr of changed) {
				oldValues[attr] = instance.previous(attr);
				newValues[attr] = instance.get(attr);
			}
		}

		await AuditLogService.recordAction(
			{
				company_id: companyId,
				user_id: userId,
				entity_type: name,
				entity_id: (instance as any).id,
				action: "UPDATE",
				old_values: oldValues,
				new_values: newValues,
				ip_address: ipAddress,
				user_agent: userAgent,
			},
			options?.transaction
		);
	});

	model.addHook("afterDestroy", "auditLogAfterDestroy", async (instance: T, options: any) => {
		if (options?.skipAudit || options?.hooks === false) return;

		const { AuditLogService } = await import("@/services/AuditLogService");
		const companyId = name === "Companies" ? (instance as any).id : ((instance as any).company_id || (instance as any).id);
		const { userId, ipAddress, userAgent } = extractContext(options, instance, "DELETE");

		const oldValues = instance.dataValues ? { ...instance.dataValues } : (instance.toJSON ? instance.toJSON() : null);

		await AuditLogService.recordAction(
			{
				company_id: companyId,
				user_id: userId,
				entity_type: name,
				entity_id: (instance as any).id,
				action: "DELETE",
				old_values: oldValues,
				new_values: null,
				ip_address: ipAddress,
				user_agent: userAgent,
			},
			options?.transaction
		);
	});

	model.addHook("afterRestore", "auditLogAfterRestore", async (instance: T, options: any) => {
		if (options?.skipAudit || options?.hooks === false) return;

		const { AuditLogService } = await import("@/services/AuditLogService");
		const companyId = name === "Companies" ? (instance as any).id : ((instance as any).company_id || (instance as any).id);
		const { userId, ipAddress, userAgent } = extractContext(options, instance, "RESTORE");

		const newValues = instance.dataValues ? { ...instance.dataValues } : (instance.toJSON ? instance.toJSON() : null);

		await AuditLogService.recordAction(
			{
				company_id: companyId,
				user_id: userId,
				entity_type: name,
				entity_id: (instance as any).id,
				action: "RESTORE",
				old_values: null,
				new_values: newValues,
				ip_address: ipAddress,
				user_agent: userAgent,
			},
			options?.transaction
		);
	});
}
