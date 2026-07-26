import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { AuditLogService } from "@/services/AuditLogService";
import { CompanyRepository } from "@/repositories/CompanyRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { AuditLogs, Companies, Users } from "@/models";
import { sequelize } from "@/lib/db/sequelize";
import { ValidationError } from "@/lib/errors/AppError";

describe("AuditLogService", () => {
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

		const comp = await CompanyRepository.create({ name: "AUDIT_SERVICE_TEST_CO", is_company: true });
		companyId = comp.id;

		const user = await UserRepository.create({
			company_id: companyId,
			username: "audit_service_user",
			pass_hash: "hash",
			role: 1,
			created_by: "00000000-0000-0000-0000-000000000000",
		});
		userId = user.id;
	});

	afterAll(async () => {
		if (companyId) {
			await AuditLogs.destroy({ where: { company_id: companyId }, force: true });
			await Users.destroy({ where: { company_id: companyId }, force: true });
			await Companies.destroy({ where: { id: companyId }, force: true });
		}
	});

	describe("recordAction", () => {
		it("should validate input and record audit action", async () => {
			const result = await AuditLogService.recordAction({
				company_id: companyId,
				user_id: userId,
				entity_type: "receivable_debts",
				entity_id: "30000000-0000-0000-0000-000000000001",
				action: "CREATE",
				old_values: null,
				new_values: { amount: 500, currency: "USD" },
				ip_address: "127.0.0.1",
				user_agent: "Vitest",
			});

			expect(result.id).toBeDefined();
			expect(result.company_id).toBe(companyId);
			expect(result.user_id).toBe(userId);
			expect(result.entity_type).toBe("receivable_debts");
			expect(result.action).toBe("CREATE");
			expect(result.new_values).toEqual({ amount: 500, currency: "USD" });
		});

		it("should throw ValidationError if required parameters are missing", async () => {
			await expect(
				AuditLogService.recordAction({
					company_id: "",
					entity_type: "receivable_debts",
					entity_id: "30000000-0000-0000-0000-000000000001",
					action: "CREATE",
				} as any)
			).rejects.toThrow(ValidationError);

			await expect(
				AuditLogService.recordAction({
					company_id: companyId,
					entity_type: "",
					entity_id: "30000000-0000-0000-0000-000000000001",
					action: "CREATE",
				} as any)
			).rejects.toThrow(ValidationError);
		});

		it("should throw ValidationError if action is invalid", async () => {
			await expect(
				AuditLogService.recordAction({
					company_id: companyId,
					entity_type: "receivable_debts",
					entity_id: "30000000-0000-0000-0000-000000000001",
					action: "INVALID_ACTION" as any,
				})
			).rejects.toThrow(ValidationError);
		});
	});

	describe("getLogs", () => {
		beforeAll(async () => {
			await AuditLogService.recordAction({
				company_id: companyId,
				user_id: userId,
				entity_type: "receivable_customers",
				entity_id: "40000000-0000-0000-0000-000000000001",
				action: "CREATE",
				new_values: { name: "Test Customer" },
			});
			await AuditLogService.recordAction({
				company_id: companyId,
				user_id: userId,
				entity_type: "receivable_customers",
				entity_id: "40000000-0000-0000-0000-000000000001",
				action: "UPDATE",
				old_values: { name: "Test Customer" },
				new_values: { name: "Updated Customer" },
			});
		});

		it("should return paginated audit log dtos with defaults", async () => {
			const res = await AuditLogService.getLogs(companyId);

			expect(res.data).toBeDefined();
			expect(Array.isArray(res.data)).toBe(true);
			expect(res.total).toBeGreaterThanOrEqual(3);
			expect(res.page).toBe(1);
			expect(res.limit).toBe(20);
		});

		it("should apply custom pagination, sorting, and filtering", async () => {
			const res = await AuditLogService.getLogs(
				companyId,
				1,
				1,
				[{ id: "created_at", desc: true }],
				[{ id: "action", value: "UPDATE" }]
			);

			expect(res.data.length).toBe(1);
			expect(res.data[0].action).toBe("UPDATE");
			expect(res.limit).toBe(1);
			expect(res.page).toBe(1);
		});

		it("should throw ValidationError if companyId is missing", async () => {
			await expect(AuditLogService.getLogs("")).rejects.toThrow(ValidationError);
		});
	});
});
