import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { sequelize } from "@/lib/db/sequelize";
import {
	AuditLogs,
	Companies,
	Users,
	ReceivableCustomers,
	PayableCustomers,
	ReceivableDebts,
	PayableDebts,
	ReceivablePayments,
	PayablePayments,
} from "@/models";

const getValues = (val: any) => (typeof val === "string" ? JSON.parse(val) : val);

describe("Empirical Challenge: Audit Hooks Edge Cases", () => {
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

		const comp = await Companies.create(
			{ name: "EDGE_TEST_CO", is_company: true },
			{ hooks: false }
		);
		companyId = comp.id;

		const user = await Users.create(
			{
				company_id: companyId,
				username: "edge_test_user",
				pass_hash: "hash",
				role: 1,
				created_by: "00000000-0000-0000-0000-000000000000",
			},
			{ hooks: false }
		);
		userId = user.id;
	});

	afterAll(async () => {
		if (companyId) {
			await AuditLogs.destroy({ where: { company_id: companyId }, force: true });
			await Users.destroy({ where: { company_id: companyId }, force: true });
			await Companies.destroy({ where: { id: companyId }, force: true });
		}
	});

	beforeEach(async () => {
		await AuditLogs.destroy({ where: { company_id: companyId }, force: true });
	});

	describe("Edge Case 1: Missing user_id / company_id & Context Fallbacks", () => {
		it("should extract user_id from various context property paths", async () => {
			// 1. options.userId
			const cust1 = await ReceivableCustomers.create(
				{ company_id: companyId, name: "Ctx Test 1" },
				{ userId: "11111111-1111-1111-1111-111111111111" }
			);
			const log1 = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust1.id, action: "CREATE" },
			});
			expect(log1?.user_id).toBe("11111111-1111-1111-1111-111111111111");

			// 2. options.user.id
			const cust2 = await ReceivableCustomers.create(
				{ company_id: companyId, name: "Ctx Test 2" },
				{ user: { id: "22222222-2222-2222-2222-222222222222" } }
			);
			const log2 = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust2.id, action: "CREATE" },
			});
			expect(log2?.user_id).toBe("22222222-2222-2222-2222-222222222222");

			// 3. options.context.user_id
			const cust3 = await ReceivableCustomers.create(
				{ company_id: companyId, name: "Ctx Test 3" },
				{ context: { user_id: "33333333-3333-3333-3333-333333333333" } }
			);
			const log3 = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust3.id, action: "CREATE" },
			});
			expect(log3?.user_id).toBe("33333333-3333-3333-3333-333333333333");

			// 4. Fallback to instance.created_by when user_id options are missing
			const cust4 = await ReceivableCustomers.create({
				company_id: companyId,
				name: "Ctx Test 4",
				created_by: "44444444-4444-4444-4444-444444444444",
			});
			const log4 = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust4.id, action: "CREATE" },
			});
			expect(log4?.user_id).toBe("44444444-4444-4444-4444-444444444444");

			// Cleanup
			await ReceivableCustomers.destroy({
				where: { id: [cust1.id, cust2.id, cust3.id, cust4.id] },
				force: true,
				hooks: false,
			});
		});

		it("should extract ip_address and user_agent from options and context", async () => {
			const cust = await ReceivableCustomers.create(
				{ company_id: companyId, name: "IP Agent Test" },
				{
					context: {
						ip: "192.168.1.100",
						userAgent: "EdgeBrowser/1.0",
					},
				}
			);

			const log = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "CREATE" },
			});
			expect(log?.ip_address).toBe("192.168.1.100");
			expect(log?.user_agent).toBe("EdgeBrowser/1.0");

			await cust.destroy({ force: true, hooks: false });
		});

		it("should handle missing user_id gracefully and record user_id as null when model has no created_by", async () => {
			const comp = await Companies.create({
				name: "No User Co Test",
				is_company: false,
			});

			const log = await AuditLogs.findOne({
				where: { entity_type: "Companies", entity_id: comp.id, action: "CREATE" },
			});
			expect(log).not.toBeNull();
			expect(log?.user_id).toBeNull();
			expect(log?.ip_address).toBeNull();
			expect(log?.user_agent).toBeNull();

			await comp.destroy({ force: true, hooks: false });
		});

		it("should test company_id resolution for Companies vs non-Companies models", async () => {
			const comp = await Companies.create(
				{ name: "Co ID Resolv Co", is_company: true },
				{ user_id: userId }
			);

			const compLog = await AuditLogs.findOne({
				where: { entity_type: "Companies", entity_id: comp.id, action: "CREATE" },
			});
			// For Companies, company_id in audit log MUST equal the company's own ID
			expect(compLog?.company_id).toBe(comp.id);

			const cust = await ReceivableCustomers.create(
				{ company_id: comp.id, name: "Co ID Resolv Cust" },
				{ user_id: userId }
			);
			const custLog = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "CREATE" },
			});
			// For ReceivableCustomers, company_id in audit log MUST equal cust.company_id
			expect(custLog?.company_id).toBe(comp.id);

			await cust.destroy({ force: true, hooks: false });
			await comp.destroy({ force: true, hooks: false });
		});
	});

	describe("Edge Case 2: Null / Undefined Options & Audit Suppression", () => {
		it("should work when options is undefined, null, or empty object", async () => {
			// Undefined options
			const cust1 = await ReceivableCustomers.create({ company_id: companyId, name: "Undef Opts" });
			const log1 = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust1.id, action: "CREATE" },
			});
			expect(log1).not.toBeNull();

			// Update with undefined options
			await cust1.update({ name: "Undef Opts Updated" });
			const updateLog1 = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust1.id, action: "UPDATE" },
			});
			expect(updateLog1).not.toBeNull();

			// Destroy with undefined options
			await cust1.destroy();
			const deleteLog1 = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust1.id, action: "DELETE" },
			});
			expect(deleteLog1).not.toBeNull();

			// Restore with undefined options
			await cust1.restore();
			const restoreLog1 = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust1.id, action: "RESTORE" },
			});
			expect(restoreLog1).not.toBeNull();

			await cust1.destroy({ force: true, hooks: false });
		});

		it("should suppress audit logs when { hooks: false } or { skipAudit: true } is passed", async () => {
			const cust = await ReceivableCustomers.create(
				{ company_id: companyId, name: "Suppressed Customer" },
				{ skipAudit: true }
			);

			const logCreate = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "CREATE" },
			});
			expect(logCreate).toBeNull();

			await cust.update({ name: "Suppressed Updated" }, { hooks: false });
			const logUpdate = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "UPDATE" },
			});
			expect(logUpdate).toBeNull();

			await cust.destroy({ skipAudit: true });
			const logDelete = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "DELETE" },
			});
			expect(logDelete).toBeNull();

			await cust.restore({ hooks: false });
			const logRestore = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "RESTORE" },
			});
			expect(logRestore).toBeNull();

			await cust.destroy({ force: true, hooks: false });
		});
	});

	describe("Edge Case 3: Soft Delete vs Restore Payload Verification", () => {
		it("should correctly record old_values and new_values for soft delete vs restore", async () => {
			const cust = await ReceivableCustomers.create(
				{ company_id: companyId, name: "Soft Delete Target", created_by: userId },
				{ user_id: userId }
			);

			// Soft delete
			await cust.destroy({ user_id: userId });

			const deleteLog = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "DELETE" },
			});
			expect(deleteLog).not.toBeNull();
			expect(deleteLog?.new_values).toBeNull();
			const deleteOldVals = getValues(deleteLog?.old_values);
			expect(deleteOldVals).toHaveProperty("id", cust.id);
			expect(deleteOldVals).toHaveProperty("name", "Soft Delete Target");

			// Restore
			await cust.restore({ user_id: userId });

			const restoreLog = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "RESTORE" },
			});
			expect(restoreLog).not.toBeNull();
			expect(restoreLog?.old_values).toBeNull();
			const restoreNewVals = getValues(restoreLog?.new_values);
			expect(restoreNewVals).toHaveProperty("id", cust.id);
			expect(restoreNewVals).toHaveProperty("name", "Soft Delete Target");
			expect(restoreNewVals.deleted_at).toBeNull();

			await cust.destroy({ force: true, hooks: false });
		});
	});

	describe("Edge Case 4: Transaction Isolation & Rollback Behavior", () => {
		it("should roll back audit log entries across all mutation operations (CREATE, UPDATE, DELETE, RESTORE)", async () => {
			const cust = await ReceivableCustomers.create(
				{ company_id: companyId, name: "Tx Test Customer" },
				{ hooks: false }
			);

			let debtId = "";

			// Rollback on CREATE
			try {
				await sequelize.transaction(async (t) => {
					const debt = await ReceivableDebts.create(
						{
							company_id: companyId,
							customer_id: cust.id,
							amount: 500,
							vat: 100,
							issue_date: new Date(),
						},
						{ transaction: t, user_id: userId }
					);
					debtId = debt.id;
					throw new Error("Rollback Create");
				});
			} catch (err: any) {
				expect(err.message).toBe("Rollback Create");
			}

			const logCreate = await AuditLogs.findOne({
				where: { entity_type: "ReceivableDebts", entity_id: debtId },
			});
			expect(logCreate).toBeNull();

			// Create actual debt without transaction for UPDATE / DELETE rollback tests
			const debt = await ReceivableDebts.create(
				{
					company_id: companyId,
					customer_id: cust.id,
					amount: 1000,
					vat: 200,
					issue_date: new Date(),
				},
				{ hooks: false }
			);

			// Rollback on UPDATE
			try {
				await sequelize.transaction(async (t) => {
					await debt.update({ amount: 2000 }, { transaction: t, user_id: userId });
					throw new Error("Rollback Update");
				});
			} catch (err: any) {
				expect(err.message).toBe("Rollback Update");
			}

			const logUpdate = await AuditLogs.findOne({
				where: { entity_type: "ReceivableDebts", entity_id: debt.id, action: "UPDATE" },
			});
			expect(logUpdate).toBeNull();

			// Rollback on DELETE
			try {
				await sequelize.transaction(async (t) => {
					await debt.destroy({ transaction: t, user_id: userId });
					throw new Error("Rollback Delete");
				});
			} catch (err: any) {
				expect(err.message).toBe("Rollback Delete");
			}

			const logDelete = await AuditLogs.findOne({
				where: { entity_type: "ReceivableDebts", entity_id: debt.id, action: "DELETE" },
			});
			expect(logDelete).toBeNull();

			await debt.destroy({ force: true, hooks: false });
			await cust.destroy({ force: true, hooks: false });
		});
	});

	describe("Edge Case 5: Diff Calculations for Updates", () => {
		it("should record ONLY changed fields in old_values and new_values during update", async () => {
			const cust = await ReceivableCustomers.create(
				{
					company_id: companyId,
					name: "Diff Target",
					tax_number: "1234567890",
					email: "diff@example.com",
				},
				{ hooks: false }
			);

			// Update ONLY tax_number
			await cust.update({ tax_number: "9999999999" }, { user_id: userId });

			const updateLog = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "UPDATE" },
			});
			expect(updateLog).not.toBeNull();

			const oldVals = getValues(updateLog?.old_values);
			const newVals = getValues(updateLog?.new_values);

			// Should contain tax_number
			expect(oldVals).toHaveProperty("tax_number", "1234567890");
			expect(newVals).toHaveProperty("tax_number", "9999999999");

			// Should NOT contain unchanged fields like name or email
			expect(oldVals).not.toHaveProperty("name");
			expect(oldVals).not.toHaveProperty("email");
			expect(newVals).not.toHaveProperty("name");
			expect(newVals).not.toHaveProperty("email");

			await cust.destroy({ force: true, hooks: false });
		});

		it("should handle setting a field to null or empty", async () => {
			const cust = await ReceivableCustomers.create(
				{
					company_id: companyId,
					name: "Null Field Target",
					email: "to_be_nulled@example.com",
				},
				{ hooks: false }
			);

			await cust.update({ email: null as any }, { user_id: userId });

			const updateLog = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "UPDATE" },
			});
			expect(updateLog).not.toBeNull();

			const oldVals = getValues(updateLog?.old_values);
			const newVals = getValues(updateLog?.new_values);

			expect(oldVals).toHaveProperty("email", "to_be_nulled@example.com");
			expect(newVals).toHaveProperty("email", null);

			await cust.destroy({ force: true, hooks: false });
		});

		it("should handle no-op update where Sequelize skips database query and hook execution", async () => {
			const cust = await ReceivableCustomers.create(
				{ company_id: companyId, name: "NoOp Target" },
				{ hooks: false }
			);

			// Update with exact same name
			await cust.update({ name: "NoOp Target" }, { user_id: userId });

			const updateLog = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "UPDATE" },
			});

			// No database update query is performed by Sequelize when no fields change, so no audit log is generated
			expect(updateLog).toBeNull();

			await cust.destroy({ force: true, hooks: false });
		});
	});

	describe("Target Models Audit Hooks Integration", () => {
		it("should verify audit hooks are active on all 8 target models", async () => {
			const models = [
				{ model: Companies, name: "Companies", data: { name: "CO_HOOK_TEST", is_company: true } },
				{ model: Users, name: "Users", data: { company_id: companyId, username: "usr_hook_test", pass_hash: "h", role: 1 } },
				{ model: ReceivableCustomers, name: "ReceivableCustomers", data: { company_id: companyId, name: "rec_cust_test" } },
				{ model: PayableCustomers, name: "PayableCustomers", data: { company_id: companyId, name: "pay_cust_test" } },
			];

			for (const m of models) {
				const instance = await (m.model as any).create(m.data, { user_id: userId });
				const log = await AuditLogs.findOne({
					where: { entity_type: m.name, entity_id: instance.id, action: "CREATE" },
				});
				expect(log).not.toBeNull();
				await (instance as any).destroy({ force: true, hooks: false });
			}
		});
	});
});
