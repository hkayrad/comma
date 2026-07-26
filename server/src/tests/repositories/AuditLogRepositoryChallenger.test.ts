import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { AuditLogRepository } from "@/repositories/AuditLogRepository";
import { CompanyRepository } from "@/repositories/CompanyRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { AuditLogs, Companies, Users } from "@/models";
import { sequelize } from "@/lib/db/sequelize";
import type { AuditLogCreateDto } from "@comma/common/types";

describe("Milestone 3 Challenger: AuditLogRepository Edge-Case & Stress Suite", () => {
	let companyId: string;
	let otherCompanyId: string;
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

		const comp1 = await Companies.create({ name: "CHALLENGER_REPO_CO_1", is_company: true }, { hooks: false });
		const comp2 = await Companies.create({ name: "CHALLENGER_REPO_CO_2", is_company: true }, { hooks: false });
		companyId = comp1.id;
		otherCompanyId = comp2.id;

		const user = await Users.create(
			{
				company_id: companyId,
				username: "challenger_repo_user",
				pass_hash: "hash",
				role: 1,
				created_by: "00000000-0000-0000-0000-000000000000",
			},
			{ hooks: false }
		);
		userId = user.id;

		// Seed fixture logs
		const actions: ("CREATE" | "UPDATE" | "DELETE" | "RESTORE")[] = ["CREATE", "UPDATE", "DELETE", "RESTORE"];
		const entityTypes = ["receivable_debts", "payable_debts", "receivable_payments", "users"];

		for (let i = 0; i < 15; i++) {
			await AuditLogRepository.createLog({
				company_id: companyId,
				user_id: userId,
				entity_type: entityTypes[i % entityTypes.length],
				entity_id: `e0000000-0000-0000-0000-${String(i + 1).padStart(12, "0")}`,
				action: actions[i % actions.length],
				old_values: { index: i },
				new_values: { index: i, updated: true },
				ip_address: `192.168.1.${i + 1}`,
				user_agent: `Agent-${i}`,
			});
		}
	});

	afterAll(async () => {
		if (companyId || otherCompanyId) {
			await AuditLogs.destroy({ where: { company_id: [companyId, otherCompanyId] }, force: true });
			await Users.destroy({ where: { company_id: [companyId, otherCompanyId] }, force: true });
			await Companies.destroy({ where: { id: [companyId, otherCompanyId] }, force: true });
		}
	});

	describe("1. Limit & Pagination Edge Cases", () => {
		it("should handle limit = 0 gracefully without throwing", async () => {
			const res = await AuditLogRepository.findAllWithPagination(companyId, 0, 0);
			expect(res).toBeDefined();
			expect(res.rows).toEqual([]);
			expect(res.count).toBe(15);
		});

		it("should handle negative limit gracefully or default behavior", async () => {
			// Passing negative limit to Sequelize findAndCountAll
			try {
				const res = await AuditLogRepository.findAllWithPagination(companyId, -5, 0);
				expect(res).toBeDefined();
				expect(res.count).toBe(15);
			} catch (err: any) {
				// SQL syntax error if DB rejects LIMIT -5
				expect(err).toBeDefined();
			}
		});

		it("should handle large offset beyond available rows", async () => {
			const res = await AuditLogRepository.findAllWithPagination(companyId, 10, 100000);
			expect(res.rows).toEqual([]);
			expect(res.count).toBe(15);
		});

		it("should handle offset = 0 correctly", async () => {
			const res = await AuditLogRepository.findAllWithPagination(companyId, 5, 0);
			expect(res.rows.length).toBe(5);
			expect(res.count).toBe(15);
		});
	});

	describe("2. Multi-Field Sorting Edge Cases", () => {
		it("should sort by multiple valid columns (entity_type ASC, created_at DESC)", async () => {
			const res = await AuditLogRepository.findAllWithPagination(
				companyId,
				20,
				0,
				[
					{ id: "entity_type", desc: false },
					{ id: "created_at", desc: true },
				]
			);

			expect(res.rows.length).toBe(15);
			for (let i = 0; i < res.rows.length - 1; i++) {
				const current = res.rows[i];
				const next = res.rows[i + 1];
				expect(current.entity_type.localeCompare(next.entity_type)).toBeLessThanOrEqual(0);
			}
		});

		it("should filter out invalid sort fields and keep valid ones", async () => {
			const res = await AuditLogRepository.findAllWithPagination(
				companyId,
				10,
				0,
				[
					{ id: "non_existent_column", desc: true },
					{ id: "action", desc: false },
				]
			);

			expect(res.rows.length).toBe(10);
			for (let i = 0; i < res.rows.length - 1; i++) {
				expect(res.rows[i].action.localeCompare(res.rows[i + 1].action)).toBeLessThanOrEqual(0);
			}
		});

		it("should fall back to default order (created_at DESC) when all sort fields are invalid", async () => {
			const res = await AuditLogRepository.findAllWithPagination(
				companyId,
				10,
				0,
				[
					{ id: "bogus_column_1", desc: false },
					{ id: "bogus_column_2", desc: true },
				]
			);

			expect(res.rows.length).toBe(10);
			for (let i = 0; i < res.rows.length - 1; i++) {
				const t1 = new Date(res.rows[i].created_at).getTime();
				const t2 = new Date(res.rows[i + 1].created_at).getTime();
				expect(t1).toBeGreaterThanOrEqual(t2);
			}
		});

		it("should neutralize potential SQL injection via sort column names", async () => {
			const res = await AuditLogRepository.findAllWithPagination(
				companyId,
				10,
				0,
				[{ id: "action; DROP TABLE audit_logs;--", desc: true }]
			);

			expect(res.rows.length).toBe(10);
			expect(res.count).toBe(15);
		});
	});

	describe("3. Invalid & Boundary Filter Fields", () => {
		it("should ignore unrecognized filter field IDs", async () => {
			const res = await AuditLogRepository.findAllWithPagination(
				companyId,
				20,
				0,
				[],
				[
					{ id: "unknown_filter_key", value: "some_value" },
					{ id: "another_fake_key", value: 12345 },
				]
			);

			expect(res.count).toBe(15);
			expect(res.rows.length).toBe(15);
		});

		it("should ignore filters with empty string, null, or undefined values", async () => {
			const res = await AuditLogRepository.findAllWithPagination(
				companyId,
				20,
				0,
				[],
				[
					{ id: "entity_type", value: "" },
					{ id: "action", value: null as any },
					{ id: "user_id", value: undefined as any },
				]
			);

			expect(res.count).toBe(15);
		});

		it("should support array values for entity_type, action, and user_id filters", async () => {
			const res = await AuditLogRepository.findAllWithPagination(
				companyId,
				20,
				0,
				[],
				[
					{ id: "entity_type", value: ["receivable_debts", "users"] },
					{ id: "action", value: ["CREATE", "DELETE"] },
				]
			);

			expect(res.rows.every((r) => ["receivable_debts", "users"].includes(r.entity_type))).toBe(true);
			expect(res.rows.every((r) => ["CREATE", "DELETE"].includes(r.action))).toBe(true);
		});

		it("should support object date range filters for created_at ({ start, end })", async () => {
			const startDate = new Date("2020-01-01");
			const endDate = new Date("2030-01-01");

			const res = await AuditLogRepository.findAllWithPagination(
				companyId,
				20,
				0,
				[],
				[
					{
						id: "created_at",
						value: { start: startDate.toISOString(), end: endDate.toISOString() },
					},
				]
			);

			expect(res.count).toBe(15);
		});

		it("should support array date range filters for created_at ([start, end])", async () => {
			const res = await AuditLogRepository.findAllWithPagination(
				companyId,
				20,
				0,
				[],
				[
					{
						id: "created_at",
						value: ["2020-01-01T00:00:00Z", "2030-01-01T00:00:00Z"],
					},
				]
			);

			expect(res.count).toBe(15);
		});

		it("should handle invalid date values in date range filters without crashing", async () => {
			const res = await AuditLogRepository.findAllWithPagination(
				companyId,
				20,
				0,
				[],
				[{ id: "start_date", value: "invalid-date-string" }]
			);

			expect(res).toBeDefined();
		});
	});

	describe("4. Company Isolation Hard Boundaries", () => {
		it("should never leak records to another companyId", async () => {
			const res = await AuditLogRepository.findAllWithPagination(otherCompanyId, 20, 0);
			expect(res.rows).toEqual([]);
			expect(res.count).toBe(0);
		});
	});
});
