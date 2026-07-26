import type { AuditLogDto, AuditLogCreateDto } from "@comma/common/types";

// Scenario 1: Invalid Action Enum Value (should fail type check)
// @ts-expect-error - Action must be one of "CREATE" | "UPDATE" | "DELETE" | "RESTORE"
export const invalidActionDto: AuditLogCreateDto = {
	company_id: "123e4567-e89b-12d3-a456-426614174000",
	entity_type: "ReceivableDebts",
	entity_id: "987f6543-e21b-12d3-a456-426614174000",
	// @ts-expect-error
	action: "INVALID_ACTION",
};

// Scenario 2: Missing Required Field (entity_id)
// @ts-expect-error - entity_id is required
export const missingFieldDto: AuditLogCreateDto = {
	company_id: "123e4567-e89b-12d3-a456-426614174000",
	entity_type: "ReceivableDebts",
	action: "CREATE",
};

// Scenario 3: Invalid Date Type for created_at
export const invalidDateDto: AuditLogDto = {
	id: "aaa11111-e89b-12d3-a456-426614174000",
	company_id: "123e4567-e89b-12d3-a456-426614174000",
	entity_type: "ReceivableDebts",
	entity_id: "987f6543-e21b-12d3-a456-426614174000",
	action: "CREATE",
	// @ts-expect-error - created_at must be a Date
	created_at: "2026-07-25T12:00:00Z",
};
