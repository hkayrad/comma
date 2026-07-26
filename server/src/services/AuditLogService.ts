import type { AuditLogDto, AuditLogCreateDto, SortItem, FilterItem } from "@comma/common/types";
import { AuditLogRepository } from "@/repositories/AuditLogRepository";
import { ValidationError } from "@/lib/errors/AppError";
import { Logger } from "@/lib/utils/logger";
import { Transaction } from "sequelize";

export class AuditLogService {
	static async recordAction(params: AuditLogCreateDto, transaction?: Transaction): Promise<AuditLogDto> {
		Logger.info("[AuditLogService] Recording action", {
			companyId: params?.company_id,
			entityType: params?.entity_type,
			entityId: params?.entity_id,
			action: params?.action,
		});

		if (!params || !params.company_id || !params.entity_type || !params.entity_id || !params.action) {
			throw new ValidationError("Missing required audit log parameters (company_id, entity_type, entity_id, action)");
		}

		const validActions = ["CREATE", "UPDATE", "DELETE", "RESTORE", "LOGIN_SUCCESS", "LOGIN_FAILED"];
		if (!validActions.includes(params.action)) {
			throw new ValidationError(`Invalid action: ${params.action}. Must be one of ${validActions.join(", ")}`);
		}

		const logModel = await AuditLogRepository.createLog(params, transaction);
		const plain = typeof logModel.toJSON === "function" ? logModel.toJSON() : (logModel as any);

		return {
			id: plain.id,
			company_id: plain.company_id,
			user_id: plain.user_id ?? null,
			entity_type: plain.entity_type,
			entity_id: plain.entity_id,
			action: plain.action,
			old_values: plain.old_values ?? null,
			new_values: plain.new_values ?? null,
			ip_address: plain.ip_address ?? null,
			user_agent: plain.user_agent ?? null,
			created_at: plain.created_at,
		};
	}

	static async getLogs(
		companyId: string,
		page?: number,
		limit?: number,
		sorting: SortItem[] = [],
		filters: FilterItem[] = []
	): Promise<{ data: AuditLogDto[]; total: number; page: number; limit: number }> {
		Logger.debug("[AuditLogService] Fetching logs", { companyId, page, limit });

		if (!companyId) {
			throw new ValidationError("companyId is required to fetch audit logs");
		}

		const limitVal = limit && limit > 0 ? limit : 20;
		const effectivePage = page !== undefined && page >= 0 ? page : 1;
		const offset = effectivePage > 0 ? (effectivePage - 1) * limitVal : 0;

		const targetCompanyId = (companyId === "ALL" || companyId === "*") ? undefined : companyId;
		const result = await AuditLogRepository.findAllWithPagination(targetCompanyId, limitVal, offset, sorting, filters);

		const data: AuditLogDto[] = result.rows.map((log) => {
			const plain = typeof log.toJSON === "function" ? log.toJSON() : (log as any);
			return {
				id: plain.id,
				company_id: plain.company_id,
				user_id: plain.user_id ?? null,
				entity_type: plain.entity_type,
				entity_id: plain.entity_id,
				action: plain.action,
				old_values: plain.old_values ?? null,
				new_values: plain.new_values ?? null,
				ip_address: plain.ip_address ?? null,
				user_agent: plain.user_agent ?? null,
				created_at: plain.created_at,
			};
		});

		return {
			data,
			total: result.count,
			page: effectivePage,
			limit: limitVal,
		};
	}
}
