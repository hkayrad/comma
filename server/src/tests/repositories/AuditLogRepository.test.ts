import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { AuditLogRepository } from "@/repositories/AuditLogRepository";
import { CompanyRepository } from "@/repositories/CompanyRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { AuditLogs, Companies, Users } from "@/models";
import { sequelize } from "@/lib/db/sequelize";
import type { AuditLogCreateDto } from "@comma/common/types";

describe("AuditLogRepository", () => {
	let companyId1: string;
	let companyId2: string;
	let userId1: string;
	let userId2: string;

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

		const comp1 = await CompanyRepository.create({ name: "AUDIT_REPO_TEST_CO_1", is_company: true });
		const comp2 = await CompanyRepository.create({ name: "AUDIT_REPO_TEST_CO_2", is_company: true });
		companyId1 = comp1.id;
		companyId2 = comp2.id;

		const user1 = await UserRepository.create({
			company_id: companyId1,
			username: "audit_repo_user_1",
			pass_hash: "hash",
			role: 1,
			created_by: "00000000-0000-0000-0000-000000000000",
		});
		const user2 = await UserRepository.create({
			company_id: companyId2,
			username: "audit_repo_user_2",
			pass_hash: "hash",
			role: 1,
			created_by: "00000000-0000-0000-0000-000000000000",
		});
		userId1 = user1.id;
		userId2 = user2.id;
	});

	afterAll(async () => {
		if (companyId1 && companyId2) {
			await AuditLogs.destroy({ where: { company_id: [companyId1, companyId2] }, force: true });
			await Users.destroy({ where: { company_id: [companyId1, companyId2] }, force: true });
			await Companies.destroy({ where: { id: [companyId1, companyId2] }, force: true });
		}
	});

	it("createLog should create an audit log record", async () => {
		const logData: AuditLogCreateDto = {
			company_id: companyId1,
			user_id: userId1,
			entity_type: "receivable_debts",
			entity_id: "10000000-0000-0000-0000-000000000001",
			action: "CREATE",
			old_values: null,
			new_values: { amount: 1500, currency: "TRY" },
			ip_address: "192.168.1.1",
			user_agent: "Mozilla/5.0",
		};

		const created = await AuditLogRepository.createLog(logData);
		expect(created.id).toBeDefined();
		expect(created.company_id).toBe(companyId1);
		expect(created.user_id).toBe(userId1);
		expect(created.entity_type).toBe("receivable_debts");
		expect(created.action).toBe("CREATE");
		expect(created.new_values).toEqual({ amount: 1500, currency: "TRY" });
	});

	it("findAllWithPagination should enforce company isolation", async () => {
		await AuditLogRepository.createLog({
			company_id: companyId1,
			user_id: userId1,
			entity_type: "receivable_payments",
			entity_id: "10000000-0000-0000-0000-000000000002",
			action: "CREATE",
		});

		await AuditLogRepository.createLog({
			company_id: companyId2,
			user_id: userId2,
			entity_type: "receivable_payments",
			entity_id: "20000000-0000-0000-0000-000000000002",
			action: "CREATE",
		});

		const result1 = await AuditLogRepository.findAllWithPagination(companyId1, 10, 0);
		const result2 = await AuditLogRepository.findAllWithPagination(companyId2, 10, 0);

		expect(result1.rows.length).toBeGreaterThan(0);
		expect(result1.rows.every((row) => row.company_id === companyId1)).toBe(true);

		expect(result2.rows.length).toBeGreaterThan(0);
		expect(result2.rows.every((row) => row.company_id === companyId2)).toBe(true);
	});

	it("findAllWithPagination should support filtering by entity_type, entity_id, action, and user_id", async () => {
		const targetEntityId = "10000000-0000-0000-0000-000000000099";

		await AuditLogRepository.createLog({
			company_id: companyId1,
			user_id: userId1,
			entity_type: "payable_debts",
			entity_id: targetEntityId,
			action: "UPDATE",
			old_values: { amount: 100 },
			new_values: { amount: 200 },
		});

		const filteredByType = await AuditLogRepository.findAllWithPagination(companyId1, 10, 0, [], [
			{ id: "entity_type", value: "payable_debts" },
		]);
		expect(filteredByType.rows.some((r) => r.entity_id === targetEntityId)).toBe(true);
		expect(filteredByType.rows.every((r) => r.entity_type === "payable_debts")).toBe(true);

		const filteredById = await AuditLogRepository.findAllWithPagination(companyId1, 10, 0, [], [
			{ id: "entity_id", value: targetEntityId },
		]);
		expect(filteredById.rows.length).toBe(1);
		expect(filteredById.rows[0].entity_id).toBe(targetEntityId);

		const filteredByAction = await AuditLogRepository.findAllWithPagination(companyId1, 10, 0, [], [
			{ id: "action", value: "UPDATE" },
		]);
		expect(filteredByAction.rows.some((r) => r.entity_id === targetEntityId)).toBe(true);
		expect(filteredByAction.rows.every((r) => r.action === "UPDATE")).toBe(true);

		const filteredByUser = await AuditLogRepository.findAllWithPagination(companyId1, 10, 0, [], [
			{ id: "user_id", value: userId1 },
		]);
		expect(filteredByUser.rows.every((r) => r.user_id === userId1)).toBe(true);
	});

	it("findAllWithPagination should support date range filtering", async () => {
		const pastDate = new Date("2020-01-01T00:00:00Z");
		const futureDate = new Date("2030-01-01T00:00:00Z");

		const result = await AuditLogRepository.findAllWithPagination(companyId1, 10, 0, [], [
			{ id: "start_date", value: pastDate.toISOString() },
			{ id: "end_date", value: futureDate.toISOString() },
		]);

		expect(result.rows.length).toBeGreaterThan(0);
	});

	it("findAllWithPagination should handle pagination and sorting correctly", async () => {
		const paginated = await AuditLogRepository.findAllWithPagination(
			companyId1,
			1,
			0,
			[{ id: "created_at", desc: true }]
		);
		expect(paginated.rows.length).toBe(1);
		expect(paginated.count).toBeGreaterThan(1);

		const secondPage = await AuditLogRepository.findAllWithPagination(
			companyId1,
			1,
			1,
			[{ id: "created_at", desc: true }]
		);
		expect(secondPage.rows.length).toBe(1);
		expect(secondPage.rows[0].id).not.toBe(paginated.rows[0].id);
	});
});
