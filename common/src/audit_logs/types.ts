import type { UUID } from "../shared/types";

export type AuditLogAction = "CREATE" | "UPDATE" | "DELETE" | "RESTORE";

export interface AuditLogDto {
	id: UUID;
	company_id: UUID;
	user_id?: UUID | null;
	entity_type: string;
	entity_id: UUID;
	action: AuditLogAction;
	old_values?: Record<string, any> | null;
	new_values?: Record<string, any> | null;
	ip_address?: string | null;
	user_agent?: string | null;
	created_at: Date;
}

export type AuditLogCreateDto = Omit<AuditLogDto, "id" | "created_at">;
