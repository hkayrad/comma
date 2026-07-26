import { describe, it, expect } from "vitest";
import { AuditLogs } from "@/models/AuditLogs";
import { Companies } from "@/models/Companies";
import { Users } from "@/models/Users";
import type { AuditLogDto, AuditLogCreateDto, AuditLogAction } from "@comma/common/types";

describe("Milestone 2 Challenger Suite: AuditLogs Model & DB Schema Validation", () => {

	describe("1. Model Attributes & Default Nullability", () => {
		it("should instantiate AuditLogs with all required and optional attributes", () => {
			const now = new Date();
			const log = AuditLogs.build({
				id: "a0000000-0000-0000-0000-000000000001",
				company_id: "c0000000-0000-0000-0000-000000000001",
				user_id: "u0000000-0000-0000-0000-000000000001",
				entity_type: "receivable_debts",
				entity_id: "e0000000-0000-0000-0000-000000000001",
				action: "CREATE",
				old_values: null,
				new_values: { amount: 500, currency: "TRY", status: "active" },
				ip_address: "192.168.1.100",
				user_agent: "Mozilla/5.0 (X11; Linux x86_64)",
				created_at: now,
			});

			expect(log.id).toBe("a0000000-0000-0000-0000-000000000001");
			expect(log.company_id).toBe("c0000000-0000-0000-0000-000000000001");
			expect(log.user_id).toBe("u0000000-0000-0000-0000-000000000001");
			expect(log.entity_type).toBe("receivable_debts");
			expect(log.entity_id).toBe("e0000000-0000-0000-0000-000000000001");
			expect(log.action).toBe("CREATE");
			expect(log.old_values).toBeNull();
			expect(log.new_values).toEqual({ amount: 500, currency: "TRY", status: "active" });
			expect(log.ip_address).toBe("192.168.1.100");
			expect(log.user_agent).toBe("Mozilla/5.0 (X11; Linux x86_64)");
			expect(log.created_at).toEqual(now);
		});

		it("should default optional fields to null when omitted", () => {
			const log = AuditLogs.build({
				company_id: "c0000000-0000-0000-0000-000000000001",
				entity_type: "companies",
				entity_id: "e0000000-0000-0000-0000-000000000002",
				action: "DELETE",
			});

			expect(log.company_id).toBe("c0000000-0000-0000-0000-000000000001");
			expect(log.user_id).toBeNull();
			expect(log.old_values).toBeNull();
			expect(log.new_values).toBeNull();
			expect(log.ip_address).toBeNull();
			expect(log.user_agent).toBeNull();
		});
	});

	describe("2. Validation & Missing Fields Constraints", () => {
		it("should fail validation when company_id is missing", async () => {
			const log = AuditLogs.build({
				// @ts-ignore
				company_id: null,
				entity_type: "receivable_debts",
				entity_id: "e0000000-0000-0000-0000-000000000001",
				action: "CREATE",
			});

			await expect(log.validate()).rejects.toThrow();
		});

		it("should fail validation when entity_type is missing", async () => {
			const log = AuditLogs.build({
				company_id: "c0000000-0000-0000-0000-000000000001",
				// @ts-ignore
				entity_type: null,
				entity_id: "e0000000-0000-0000-0000-000000000001",
				action: "CREATE",
			});

			await expect(log.validate()).rejects.toThrow();
		});

		it("should fail validation when entity_id is missing", async () => {
			const log = AuditLogs.build({
				company_id: "c0000000-0000-0000-0000-000000000001",
				entity_type: "receivable_debts",
				// @ts-ignore
				entity_id: null,
				action: "CREATE",
			});

			await expect(log.validate()).rejects.toThrow();
		});

		it("should fail validation when action is missing", async () => {
			const log = AuditLogs.build({
				company_id: "c0000000-0000-0000-0000-000000000001",
				entity_type: "receivable_debts",
				entity_id: "e0000000-0000-0000-0000-000000000001",
				// @ts-ignore
				action: null,
			});

			await expect(log.validate()).rejects.toThrow();
		});
	});

	describe("3. JSON Serialization & Complex Payload Boundaries", () => {
		it("should handle nested JSON, arrays, nulls, booleans, numbers, and special characters", () => {
			const complexOld = {
				id: "123",
				meta: { nested: { array: [1, "two", false, null], unicode: "Türkçe 🚀 ₺" } },
			};
			const complexNew = {
				id: "123",
				meta: { nested: { array: [1, "two", true, "updated"], unicode: "Türkçe 🎉 ₺" } },
			};

			const log = AuditLogs.build({
				company_id: "c0000000-0000-0000-0000-000000000001",
				entity_type: "payable_debts",
				entity_id: "e0000000-0000-0000-0000-000000000003",
				action: "UPDATE",
				old_values: complexOld,
				new_values: complexNew,
			});

			expect(log.old_values).toEqual(complexOld);
			expect(log.new_values).toEqual(complexNew);
			expect(JSON.parse(JSON.stringify(log.old_values))).toEqual(complexOld);
			expect(JSON.parse(JSON.stringify(log.new_values))).toEqual(complexNew);
		});
	});

	describe("4. Field Length & Enum Limits Analysis", () => {
		it("should accept 50-char entity_type boundary", () => {
			const longEntityType = "a".repeat(50);
			const log = AuditLogs.build({
				company_id: "c0000000-0000-0000-0000-000000000001",
				entity_type: longEntityType,
				entity_id: "e0000000-0000-0000-0000-000000000004",
				action: "RESTORE",
			});
			expect(log.entity_type).toHaveLength(50);
		});

		it("should accept 45-char IPv6 address boundary", () => {
			const maxIpv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
			const log = AuditLogs.build({
				company_id: "c0000000-0000-0000-0000-000000000001",
				entity_type: "users",
				entity_id: "e0000000-0000-0000-0000-000000000005",
				action: "CREATE",
				ip_address: maxIpv6,
			});
			expect(log.ip_address).toBe(maxIpv6);
		});

		it("should pass standard action enums", () => {
			const validActions: AuditLogAction[] = ["CREATE", "UPDATE", "DELETE", "RESTORE"];
			for (const act of validActions) {
				const log = AuditLogs.build({
					company_id: "c0000000-0000-0000-0000-000000000001",
					entity_type: "payable_payments",
					entity_id: "e0000000-0000-0000-0000-000000000006",
					action: act,
				});
				expect(log.action).toBe(act);
			}
		});

		it("should reject invalid action names via model-level enum validation", async () => {
			// Sequelize model defines action with isIn validation restricting to CREATE, UPDATE, DELETE, RESTORE
			const log = AuditLogs.build({
				company_id: "c0000000-0000-0000-0000-000000000001",
				entity_type: "receivable_debts",
				entity_id: "e0000000-0000-0000-0000-000000000001",
				// @ts-ignore
				action: "INVALID_ACTION_NAME",
			});

			// Model validation fails because action is not in allowed enum list
			await expect(log.validate()).rejects.toThrow();
		});
	});

	describe("5. Model Associations", () => {
		it("should have correct association definitions to Companies and Users", () => {
			expect(AuditLogs.associations.company).toBeDefined();
			expect(AuditLogs.associations.company.target).toBe(Companies);
			expect(AuditLogs.associations.company.foreignKey).toBe("company_id");

			expect(AuditLogs.associations.user).toBeDefined();
			expect(AuditLogs.associations.user.target).toBe(Users);
			expect(AuditLogs.associations.user.foreignKey).toBe("user_id");
		});
	});

	describe("6. DTO Conformance & Type Equivalence", () => {
		it("should seamlessly convert between AuditLogs model attributes and AuditLogDto / AuditLogCreateDto", () => {
			const createDto: AuditLogCreateDto = {
				company_id: "c0000000-0000-0000-0000-000000000001",
				user_id: "u0000000-0000-0000-0000-000000000001",
				entity_type: "receivable_payments",
				entity_id: "e0000000-0000-0000-0000-000000000007",
				action: "CREATE",
				old_values: null,
				new_values: { amount: 1500 },
				ip_address: "10.0.0.5",
				user_agent: "vitest-agent",
			};

			const logInstance = AuditLogs.build(createDto);
			expect(logInstance.company_id).toBe(createDto.company_id);
			expect(logInstance.entity_type).toBe(createDto.entity_type);
			expect(logInstance.action).toBe(createDto.action);

			const dto: AuditLogDto = {
				id: logInstance.id || "a0000000-0000-0000-0000-000000000002",
				company_id: logInstance.company_id,
				user_id: logInstance.user_id,
				entity_type: logInstance.entity_type,
				entity_id: logInstance.entity_id,
				action: logInstance.action,
				old_values: logInstance.old_values,
				new_values: logInstance.new_values,
				ip_address: logInstance.ip_address,
				user_agent: logInstance.user_agent,
				created_at: new Date(),
			};

			expect(dto.entity_type).toBe("receivable_payments");
			expect(dto.action).toBe("CREATE");
		});
	});
});
