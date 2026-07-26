import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { AuditLogService } from "@/services/AuditLogService";
import { CompanyRepository } from "@/repositories/CompanyRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { AuditLogs, Companies, Users } from "@/models";
import { sequelize } from "@/lib/db/sequelize";
import { ValidationError } from "@/lib/errors/AppError";

describe("Milestone 3 Challenger: AuditLogService Edge-Case & Boundary Suite", () => {
	let companyId: string;
	let userId: string;

	beforeAll(async () => {
		await sequelize.query(`
			CREATE TABLE IF NOT EXISTS audit_logs (
				id CHAR(36) NOT NULL PRIMARY KEY,
				company_id CHAR(36) NOT NULL,
				user_id CHAR(36) NULL,
				entity_type VARCHAR(50) NOT NULL,
				entity_id CHAR(36) NOT NULL,
				action VARCHAR(20) NOT NULL,
				old_values LONGTEXT NULL,
				new_values LONGTEXT NULL,
				ip_address VARCHAR(45) NULL,
				user_agent TEXT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);
		`);

		const comp = await Companies.create({ name: "CHALLENGER_SERVICE_CO", is_company: true }, { hooks: false });
		companyId = comp.id;

		const user = await Users.create(
			{
				company_id: companyId,
				username: "challenger_service_user",
				pass_hash: "hash",
				role: 1,
				created_by: "00000000-0000-0000-0000-000000000000",
			},
			{ hooks: false }
		);
		userId = user.id;

		// Seed fixture records
		for (let i = 1; i <= 25; i++) {
			await AuditLogService.recordAction({
				company_id: companyId,
				user_id: userId,
				entity_type: i % 2 === 0 ? "payable_debts" : "receivable_debts",
				entity_id: `b0000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
				action: i % 2 === 0 ? "UPDATE" : "CREATE",
				old_values: i % 2 === 0 ? { oldVal: i } : null,
				new_values: { newVal: i },
			});
		}
	});

	afterAll(async () => {
		if (companyId) {
			await AuditLogs.destroy({ where: { company_id: companyId }, force: true });
			await Users.destroy({ where: { company_id: companyId }, force: true });
			await Companies.destroy({ where: { id: companyId }, force: true });
		}
	});

	describe("1. getLogs Edge Cases: Pagination Bounds", () => {
		it("should fall back to default limit (20) when limit = 0 is passed", async () => {
			const res = await AuditLogService.getLogs(companyId, 1, 0);
			expect(res.limit).toBe(20);
			expect(res.data.length).toBe(20);
			expect(res.page).toBe(1);
			expect(res.total).toBe(25);
		});

		it("should fall back to default limit (20) when negative limit is passed", async () => {
			const res = await AuditLogService.getLogs(companyId, 1, -10);
			expect(res.limit).toBe(20);
			expect(res.data.length).toBe(20);
			expect(res.page).toBe(1);
		});

		it("should fall back to page 1 when negative page is passed", async () => {
			const res = await AuditLogService.getLogs(companyId, -5, 10);
			expect(res.page).toBe(1);
			expect(res.limit).toBe(10);
			expect(res.data.length).toBe(10);
		});

		it("should handle page = 0 (effectivePage = 0, offset = 0)", async () => {
			const res = await AuditLogService.getLogs(companyId, 0, 10);
			expect(res.page).toBe(0);
			expect(res.limit).toBe(10);
			expect(res.data.length).toBe(10);
		});

		it("should handle large page numbers gracefully (empty data, correct total)", async () => {
			const res = await AuditLogService.getLogs(companyId, 9999, 10);
			expect(res.data).toEqual([]);
			expect(res.total).toBe(25);
			expect(res.page).toBe(9999);
			expect(res.limit).toBe(10);
		});

		it("should reveal database error when floating point page/limit values are passed without integer parsing", async () => {
			// AuditLogService does not floor/parse floats (e.g., page=1.5, limit=10.8), leading to SQL syntax error `LIMIT 5.4, 10.8`
			await expect(AuditLogService.getLogs(companyId, 1.5, 10.8)).rejects.toThrow();
		});
	});

	describe("2. getLogs Edge Cases: Filtering and Multi-field Sorting", () => {
		it("should handle multi-field sorting across entity_type ASC and created_at DESC", async () => {
			const res = await AuditLogService.getLogs(
				companyId,
				1,
				25,
				[
					{ id: "entity_type", desc: false },
					{ id: "created_at", desc: true },
				]
			);

			expect(res.data.length).toBe(25);
			expect(res.total).toBe(25);
		});

		it("should ignore invalid filter keys in getLogs", async () => {
			const res = await AuditLogService.getLogs(
				companyId,
				1,
				10,
				[],
				[
					{ id: "malicious_key' OR 1=1--", value: "test" },
					{ id: "unknown_field", value: 100 },
				]
			);

			expect(res.data.length).toBe(10);
			expect(res.total).toBe(25);
		});

		it("should filter correctly when multiple valid filter items are combined", async () => {
			const res = await AuditLogService.getLogs(
				companyId,
				1,
				25,
				[],
				[
					{ id: "entity_type", value: "payable_debts" },
					{ id: "action", value: "UPDATE" },
				]
			);

			expect(res.data.every((item) => item.entity_type === "payable_debts" && item.action === "UPDATE")).toBe(true);
			expect(res.total).toBe(12);
		});
	});

	describe("3. recordAction Validation Edge Cases", () => {
		it("should reject missing company_id", async () => {
			await expect(
				AuditLogService.recordAction({
					company_id: "",
					entity_type: "payable_debts",
					entity_id: "id",
					action: "CREATE",
				})
			).rejects.toThrow(ValidationError);
		});

		it("should reject missing entity_type", async () => {
			await expect(
				AuditLogService.recordAction({
					company_id: companyId,
					entity_type: "",
					entity_id: "id",
					action: "CREATE",
				})
			).rejects.toThrow(ValidationError);
		});

		it("should reject missing entity_id", async () => {
			await expect(
				AuditLogService.recordAction({
					company_id: companyId,
					entity_type: "payable_debts",
					entity_id: "",
					action: "CREATE",
				})
			).rejects.toThrow(ValidationError);
		});

		it("should reject invalid action strings", async () => {
			const invalidActions = ["UPDATE_ALL", "DROP", "MODIFY", "insert", "create"];
			for (const act of invalidActions) {
				await expect(
					AuditLogService.recordAction({
						company_id: companyId,
						entity_type: "payable_debts",
						entity_id: "id",
						action: act as any,
					})
				).rejects.toThrow(ValidationError);
			}
		});

		it("should handle null optional fields in recordAction DTO return", async () => {
			const res = await AuditLogService.recordAction({
				company_id: companyId,
				user_id: null,
				entity_type: "users",
				entity_id: "50000000-0000-0000-0000-000000000001",
				action: "RESTORE",
				old_values: null,
				new_values: null,
				ip_address: null,
				user_agent: null,
			});

			expect(res.id).toBeDefined();
			expect(res.user_id).toBeNull();
			expect(res.old_values).toBeNull();
			expect(res.new_values).toBeNull();
			expect(res.ip_address).toBeNull();
			expect(res.user_agent).toBeNull();
		});

		it("should handle complex JSON payloads with special characters and nested structures", async () => {
			const complexObj = {
				nested: { deep: [1, "two", true, null] },
				text: "Financial audit trail - Türkçe: ₺ € $, UTF-8: 🚀",
			};

			const res = await AuditLogService.recordAction({
				company_id: companyId,
				user_id: userId,
				entity_type: "receivable_payments",
				entity_id: "60000000-0000-0000-0000-000000000001",
				action: "CREATE",
				new_values: complexObj,
			});

			expect(res.new_values).toEqual(complexObj);
		});
	});

	describe("4. getLogs Validation & Error Boundaries", () => {
		it("should throw ValidationError when companyId is null or undefined", async () => {
			// @ts-ignore
			await expect(AuditLogService.getLogs(null)).rejects.toThrow(ValidationError);
			// @ts-ignore
			await expect(AuditLogService.getLogs(undefined)).rejects.toThrow(ValidationError);
		});
	});
});
