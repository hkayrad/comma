import { describe, it, expect } from "vitest";
import { AuditLogs } from "@/models/AuditLogs";
import type { AuditLogDto, AuditLogCreateDto, AuditLogAction } from "@comma/common/types";

describe("AuditLogs Model & Types", () => {
	it("should correctly build an AuditLogs model instance with expected attributes", () => {
		const log = AuditLogs.build({
			company_id: "11111111-1111-1111-1111-111111111111",
			user_id: "22222222-2222-2222-2222-222222222222",
			entity_type: "receivable_debts",
			entity_id: "33333333-3333-3333-3333-333333333333",
			action: "CREATE" as AuditLogAction,
			old_values: null,
			new_values: { amount: 100, currency: "TRY" },
			ip_address: "127.0.0.1",
			user_agent: "Vitest/Test",
		});

		expect(log.company_id).toBe("11111111-1111-1111-1111-111111111111");
		expect(log.user_id).toBe("22222222-2222-2222-2222-222222222222");
		expect(log.entity_type).toBe("receivable_debts");
		expect(log.entity_id).toBe("33333333-3333-3333-3333-333333333333");
		expect(log.action).toBe("CREATE");
		expect(log.old_values).toBeNull();
		expect(log.new_values).toEqual({ amount: 100, currency: "TRY" });
		expect(log.ip_address).toBe("127.0.0.1");
		expect(log.user_agent).toBe("Vitest/Test");
	});

	it("should support AuditLogCreateDto and AuditLogDto type compliance", () => {
		const createDto: AuditLogCreateDto = {
			company_id: "11111111-1111-1111-1111-111111111111",
			user_id: "22222222-2222-2222-2222-222222222222",
			entity_type: "payable_payments",
			entity_id: "44444444-4444-4444-4444-444444444444",
			action: "UPDATE",
			old_values: { status: "pending" },
			new_values: { status: "completed" },
			ip_address: "10.0.0.1",
			user_agent: "TestAgent",
		};

		const dto: AuditLogDto = {
			...createDto,
			id: "55555555-5555-5555-5555-555555555555",
			created_at: new Date(),
		};

		expect(dto.id).toBe("55555555-5555-5555-5555-555555555555");
		expect(dto.action).toBe("UPDATE");
		expect(dto.old_values).toEqual({ status: "pending" });
		expect(dto.new_values).toEqual({ status: "completed" });
	});
});
