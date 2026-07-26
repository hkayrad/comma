import type { AuditLogDto, AuditLogCreateDto, AuditLogAction } from "@comma/common/types";
import { AuditLogs } from "../../server/src/models/AuditLogs";

console.log("=== EMPIRICAL STRESS TEST: AuditLogDto & AuditLogCreateDto ===");

// 1. Basic valid AuditLogCreateDto with minimal required fields
const minimalCreateDto: AuditLogCreateDto = {
	company_id: "123e4567-e89b-12d3-a456-426614174000",
	entity_type: "ReceivableDebts",
	entity_id: "987f6543-e21b-12d3-a456-426614174000",
	action: "CREATE",
};

// 2. Full AuditLogCreateDto with all optional fields explicitly defined
const fullCreateDto: AuditLogCreateDto = {
	company_id: "123e4567-e89b-12d3-a456-426614174000",
	user_id: "555e4567-e89b-12d3-a456-426614174000",
	entity_type: "PayablePayments",
	entity_id: "987f6543-e21b-12d3-a456-426614174000",
	action: "UPDATE",
	old_values: { amount: 100, currency: "TRY", status: "PENDING" },
	new_values: { amount: 150, currency: "TRY", status: "PAID" },
	ip_address: "192.168.1.100",
	user_agent: "Mozilla/5.0 (X11; Linux x86_64)",
};

// 3. Null values for optional fields
const nullCreateDto: AuditLogCreateDto = {
	company_id: "123e4567-e89b-12d3-a456-426614174000",
	user_id: null,
	entity_type: "Users",
	entity_id: "987f6543-e21b-12d3-a456-426614174000",
	action: "DELETE",
	old_values: null,
	new_values: null,
	ip_address: null,
	user_agent: null,
};

// 4. Complex payload structures in old_values / new_values
const complexPayloadDto: AuditLogCreateDto = {
	company_id: "123e4567-e89b-12d3-a456-426614174000",
	entity_type: "Companies",
	entity_id: "123e4567-e89b-12d3-a456-426614174000",
	action: "UPDATE",
	old_values: {
		nested: { deep: true, count: 42, tags: ["fintech", "audit"] },
		null_field: null,
		array_of_objs: [{ id: 1 }, { id: 2 }],
	},
	new_values: {
		nested: { deep: false, count: 43, tags: ["fintech", "audit", "updated"] },
		null_field: "populated",
		array_of_objs: [{ id: 1 }, { id: 2 }, { id: 3 }],
	},
};

// 5. Full AuditLogDto validation
const fullAuditLogDto: AuditLogDto = {
	id: "aaa11111-e89b-12d3-a456-426614174000",
	company_id: "123e4567-e89b-12d3-a456-426614174000",
	user_id: "555e4567-e89b-12d3-a456-426614174000",
	entity_type: "ReceivableDebts",
	entity_id: "987f6543-e21b-12d3-a456-426614174000",
	action: "RESTORE",
	old_values: { deleted_at: "2026-01-01T00:00:00Z" },
	new_values: { deleted_at: null },
	ip_address: "2001:db8::1",
	user_agent: "PostmanRuntime/7.32.3",
	created_at: new Date(),
};

// 6. Test direct assignment between AuditLogCreateDto and AuditLogs model build/creation attributes
function mapDtoToModelAttributes(dto: AuditLogCreateDto) {
	return {
		company_id: dto.company_id,
		user_id: dto.user_id,
		entity_type: dto.entity_type,
		entity_id: dto.entity_id,
		action: dto.action,
		old_values: dto.old_values,
		new_values: dto.new_values,
		ip_address: dto.ip_address,
		user_agent: dto.user_agent,
	};
}

// 7. Model mapping test function
function mapModelToDto(modelInstance: AuditLogs): AuditLogDto {
	return {
		id: modelInstance.id,
		company_id: modelInstance.company_id,
		user_id: modelInstance.user_id,
		entity_type: modelInstance.entity_type,
		entity_id: modelInstance.entity_id,
		action: modelInstance.action,
		old_values: modelInstance.old_values,
		new_values: modelInstance.new_values,
		ip_address: modelInstance.ip_address,
		user_agent: modelInstance.user_agent,
		created_at: modelInstance.created_at,
	};
}

console.log("Minimal DTO:", minimalCreateDto);
console.log("Full DTO:", fullCreateDto);
console.log("Null DTO:", nullCreateDto);
console.log("Complex Payload DTO:", complexPayloadDto);
console.log("Full AuditLogDto:", fullAuditLogDto);
console.log("Mapped Attributes:", mapDtoToModelAttributes(fullCreateDto));
console.log("STRESS TEST PASSED SUCCESSFULLY");
