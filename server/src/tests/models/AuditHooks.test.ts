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

describe("Sequelize Mutation Audit Hooks Integration", () => {
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
			{ name: "HOOKS_TEST_CO", is_company: true },
			{ hooks: false }
		);
		companyId = comp.id;

		const user = await Users.create(
			{
				company_id: companyId,
				username: "hooks_test_user",
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

	describe("Companies Audit Hooks", () => {
		it("should log afterCreate, afterUpdate, afterDestroy, and afterRestore for Companies", async () => {
			const newCo = await Companies.create(
				{ name: "HOOK_CO_MUTATION", is_company: true },
				{ user_id: userId, ip_address: "127.0.0.1", user_agent: "TestAgent" }
			);

			const createLogs = await AuditLogs.findAll({
				where: { entity_type: "Companies", entity_id: newCo.id, action: "CREATE" },
			});
			expect(createLogs.length).toBe(1);
			expect(createLogs[0].company_id).toBe(newCo.id);
			expect(createLogs[0].user_id).toBe(userId);
			expect(createLogs[0].ip_address).toBe("127.0.0.1");
			expect(createLogs[0].user_agent).toBe("TestAgent");
			expect(createLogs[0].old_values).toBeNull();
			expect(getValues(createLogs[0].new_values)).toHaveProperty("name", "HOOK_CO_MUTATION");

			// Update
			await newCo.update(
				{ name: "HOOK_CO_MUTATION_UPDATED" },
				{ user_id: userId, ip_address: "127.0.0.2" }
			);
			const updateLogs = await AuditLogs.findAll({
				where: { entity_type: "Companies", entity_id: newCo.id, action: "UPDATE" },
			});
			expect(updateLogs.length).toBe(1);
			expect(getValues(updateLogs[0].old_values)).toHaveProperty("name", "HOOK_CO_MUTATION");
			expect(getValues(updateLogs[0].new_values)).toHaveProperty("name", "HOOK_CO_MUTATION_UPDATED");

			// Soft Delete
			await newCo.destroy({ user_id: userId });
			const deleteLogs = await AuditLogs.findAll({
				where: { entity_type: "Companies", entity_id: newCo.id, action: "DELETE" },
			});
			expect(deleteLogs.length).toBe(1);
			expect(getValues(deleteLogs[0].old_values)).toHaveProperty("name", "HOOK_CO_MUTATION_UPDATED");
			expect(deleteLogs[0].new_values).toBeNull();

			// Restore
			await newCo.restore({ user_id: userId });
			const restoreLogs = await AuditLogs.findAll({
				where: { entity_type: "Companies", entity_id: newCo.id, action: "RESTORE" },
			});
			expect(restoreLogs.length).toBe(1);
			expect(restoreLogs[0].old_values).toBeNull();
			expect(getValues(restoreLogs[0].new_values)).toHaveProperty("name", "HOOK_CO_MUTATION_UPDATED");

			// Cleanup
			await newCo.destroy({ force: true, hooks: false });
		});
	});

	describe("Users Audit Hooks", () => {
		it("should log afterCreate, afterUpdate, afterDestroy, and afterRestore for Users", async () => {
			const newUser = await Users.create(
				{
					company_id: companyId,
					username: "hook_user_test",
					pass_hash: "hash",
					role: 1,
					created_by: userId,
				},
				{ user_id: userId }
			);

			const createLogs = await AuditLogs.findAll({
				where: { entity_type: "Users", entity_id: newUser.id, action: "CREATE" },
			});
			expect(createLogs.length).toBe(1);
			expect(createLogs[0].company_id).toBe(companyId);
			expect(createLogs[0].user_id).toBe(userId);

			// Update
			await newUser.update({ username: "hook_user_updated" }, { user_id: userId });
			const updateLogs = await AuditLogs.findAll({
				where: { entity_type: "Users", entity_id: newUser.id, action: "UPDATE" },
			});
			expect(updateLogs.length).toBe(1);
			expect(getValues(updateLogs[0].old_values)).toHaveProperty("username", "hook_user_test");
			expect(getValues(updateLogs[0].new_values)).toHaveProperty("username", "hook_user_updated");

			// Destroy
			await newUser.destroy({ user_id: userId });
			const deleteLogs = await AuditLogs.findAll({
				where: { entity_type: "Users", entity_id: newUser.id, action: "DELETE" },
			});
			expect(deleteLogs.length).toBe(1);

			// Restore
			await newUser.restore({ user_id: userId });
			const restoreLogs = await AuditLogs.findAll({
				where: { entity_type: "Users", entity_id: newUser.id, action: "RESTORE" },
			});
			expect(restoreLogs.length).toBe(1);

			await newUser.destroy({ force: true, hooks: false });
		});
	});

	describe("ReceivableCustomers & PayableCustomers Audit Hooks", () => {
		it("should log mutations for ReceivableCustomers", async () => {
			const cust = await ReceivableCustomers.create(
				{
					company_id: companyId,
					name: "Rec Cust 1",
					created_by: userId,
				},
				{ user_id: userId }
			);

			const createLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "CREATE" },
			});
			expect(createLogs.length).toBe(1);

			await cust.update({ name: "Rec Cust 1 Updated" }, { user_id: userId });
			const updateLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "UPDATE" },
			});
			expect(updateLogs.length).toBe(1);
			expect(getValues(updateLogs[0].old_values)).toHaveProperty("name", "Rec Cust 1");
			expect(getValues(updateLogs[0].new_values)).toHaveProperty("name", "Rec Cust 1 Updated");

			await cust.destroy({ user_id: userId });
			const deleteLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "DELETE" },
			});
			expect(deleteLogs.length).toBe(1);

			await cust.restore({ user_id: userId });
			const restoreLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivableCustomers", entity_id: cust.id, action: "RESTORE" },
			});
			expect(restoreLogs.length).toBe(1);

			await cust.destroy({ force: true, hooks: false });
		});

		it("should log mutations for PayableCustomers", async () => {
			const cust = await PayableCustomers.create(
				{
					company_id: companyId,
					name: "Pay Cust 1",
					created_by: userId,
				},
				{ user_id: userId }
			);

			const createLogs = await AuditLogs.findAll({
				where: { entity_type: "PayableCustomers", entity_id: cust.id, action: "CREATE" },
			});
			expect(createLogs.length).toBe(1);

			await cust.update({ name: "Pay Cust 1 Updated" }, { user_id: userId });
			const updateLogs = await AuditLogs.findAll({
				where: { entity_type: "PayableCustomers", entity_id: cust.id, action: "UPDATE" },
			});
			expect(updateLogs.length).toBe(1);

			await cust.destroy({ user_id: userId });
			const deleteLogs = await AuditLogs.findAll({
				where: { entity_type: "PayableCustomers", entity_id: cust.id, action: "DELETE" },
			});
			expect(deleteLogs.length).toBe(1);

			await cust.restore({ user_id: userId });
			const restoreLogs = await AuditLogs.findAll({
				where: { entity_type: "PayableCustomers", entity_id: cust.id, action: "RESTORE" },
			});
			expect(restoreLogs.length).toBe(1);

			await cust.destroy({ force: true, hooks: false });
		});
	});

	describe("ReceivableDebts & PayableDebts Audit Hooks", () => {
		it("should log mutations for ReceivableDebts", async () => {
			const recCust = await ReceivableCustomers.create(
				{ company_id: companyId, name: "Rec Debt Cust", created_by: userId },
				{ hooks: false }
			);

			const debt = await ReceivableDebts.create(
				{
					company_id: companyId,
					customer_id: recCust.id,
					amount: 1000,
					vat: 200,
					issue_date: new Date(),
					created_by: userId,
				},
				{ user_id: userId, ip_address: "10.0.0.1" }
			);

			const createLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivableDebts", entity_id: debt.id, action: "CREATE" },
			});
			expect(createLogs.length).toBe(1);
			expect(createLogs[0].company_id).toBe(companyId);

			await debt.update({ amount: 1200 }, { user_id: userId });
			const updateLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivableDebts", entity_id: debt.id, action: "UPDATE" },
			});
			expect(updateLogs.length).toBe(1);
			expect(getValues(updateLogs[0].old_values)).toHaveProperty("amount", 1000);
			expect(getValues(updateLogs[0].new_values)).toHaveProperty("amount", 1200);

			await debt.destroy({ user_id: userId });
			const deleteLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivableDebts", entity_id: debt.id, action: "DELETE" },
			});
			expect(deleteLogs.length).toBe(1);

			await debt.restore({ user_id: userId });
			const restoreLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivableDebts", entity_id: debt.id, action: "RESTORE" },
			});
			expect(restoreLogs.length).toBe(1);

			await debt.destroy({ force: true, hooks: false });
			await recCust.destroy({ force: true, hooks: false });
		});

		it("should log mutations for PayableDebts", async () => {
			const payCust = await PayableCustomers.create(
				{ company_id: companyId, name: "Pay Debt Cust", created_by: userId },
				{ hooks: false }
			);

			const debt = await PayableDebts.create(
				{
					company_id: companyId,
					customer_id: payCust.id,
					amount: 500,
					vat: 100,
					issue_date: new Date(),
					created_by: userId,
				},
				{ user_id: userId }
			);

			const createLogs = await AuditLogs.findAll({
				where: { entity_type: "PayableDebts", entity_id: debt.id, action: "CREATE" },
			});
			expect(createLogs.length).toBe(1);

			await debt.update({ amount: 600 }, { user_id: userId });
			const updateLogs = await AuditLogs.findAll({
				where: { entity_type: "PayableDebts", entity_id: debt.id, action: "UPDATE" },
			});
			expect(updateLogs.length).toBe(1);

			await debt.destroy({ user_id: userId });
			const deleteLogs = await AuditLogs.findAll({
				where: { entity_type: "PayableDebts", entity_id: debt.id, action: "DELETE" },
			});
			expect(deleteLogs.length).toBe(1);

			await debt.restore({ user_id: userId });
			const restoreLogs = await AuditLogs.findAll({
				where: { entity_type: "PayableDebts", entity_id: debt.id, action: "RESTORE" },
			});
			expect(restoreLogs.length).toBe(1);

			await debt.destroy({ force: true, hooks: false });
			await payCust.destroy({ force: true, hooks: false });
		});
	});

	describe("ReceivablePayments & PayablePayments Audit Hooks", () => {
		it("should log mutations for ReceivablePayments", async () => {
			const recCust = await ReceivableCustomers.create(
				{ company_id: companyId, name: "Rec Pay Cust", created_by: userId },
				{ hooks: false }
			);

			const payment = await ReceivablePayments.create(
				{
					company_id: companyId,
					customer_id: recCust.id,
					amount: 500,
					payment_date: new Date(),
					created_by: userId,
				},
				{ user_id: userId }
			);

			const createLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivablePayments", entity_id: payment.id, action: "CREATE" },
			});
			expect(createLogs.length).toBe(1);

			await payment.update({ amount: 600 }, { user_id: userId });
			const updateLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivablePayments", entity_id: payment.id, action: "UPDATE" },
			});
			expect(updateLogs.length).toBe(1);

			await payment.destroy({ user_id: userId });
			const deleteLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivablePayments", entity_id: payment.id, action: "DELETE" },
			});
			expect(deleteLogs.length).toBe(1);

			await payment.restore({ user_id: userId });
			const restoreLogs = await AuditLogs.findAll({
				where: { entity_type: "ReceivablePayments", entity_id: payment.id, action: "RESTORE" },
			});
			expect(restoreLogs.length).toBe(1);

			await payment.destroy({ force: true, hooks: false });
			await recCust.destroy({ force: true, hooks: false });
		});

		it("should log mutations for PayablePayments", async () => {
			const payCust = await PayableCustomers.create(
				{ company_id: companyId, name: "Pay Pay Cust", created_by: userId },
				{ hooks: false }
			);

			const payment = await PayablePayments.create(
				{
					company_id: companyId,
					customer_id: payCust.id,
					amount: 300,
					payment_date: new Date(),
					created_by: userId,
				},
				{ user_id: userId }
			);

			const createLogs = await AuditLogs.findAll({
				where: { entity_type: "PayablePayments", entity_id: payment.id, action: "CREATE" },
			});
			expect(createLogs.length).toBe(1);

			await payment.update({ amount: 400 }, { user_id: userId });
			const updateLogs = await AuditLogs.findAll({
				where: { entity_type: "PayablePayments", entity_id: payment.id, action: "UPDATE" },
			});
			expect(updateLogs.length).toBe(1);

			await payment.destroy({ user_id: userId });
			const deleteLogs = await AuditLogs.findAll({
				where: { entity_type: "PayablePayments", entity_id: payment.id, action: "DELETE" },
			});
			expect(deleteLogs.length).toBe(1);

			await payment.restore({ user_id: userId });
			const restoreLogs = await AuditLogs.findAll({
				where: { entity_type: "PayablePayments", entity_id: payment.id, action: "RESTORE" },
			});
			expect(restoreLogs.length).toBe(1);

			await payment.destroy({ force: true, hooks: false });
			await payCust.destroy({ force: true, hooks: false });
		});
	});

	describe("Transaction Propagation in Hooks", () => {
		it("should propagate transaction and rollback audit log if outer transaction rolls back", async () => {
			const recCust = await ReceivableCustomers.create(
				{ company_id: companyId, name: "Tx Cust", created_by: userId },
				{ hooks: false }
			);

			let createdDebtId = "";

			try {
				await sequelize.transaction(async (t) => {
					const debt = await ReceivableDebts.create(
						{
							company_id: companyId,
							customer_id: recCust.id,
							amount: 999,
							vat: 100,
							issue_date: new Date(),
							created_by: userId,
						},
						{ transaction: t, user_id: userId }
					);
					createdDebtId = debt.id;

					// Verify audit log exists inside transaction
					const inTxLog = await AuditLogs.findOne({
						where: { entity_type: "ReceivableDebts", entity_id: debt.id },
						transaction: t,
					});
					expect(inTxLog).not.toBeNull();

					throw new Error("Intentional Rollback");
				});
			} catch (err: any) {
				expect(err.message).toBe("Intentional Rollback");
			}

			// Verify audit log was rolled back
			const afterRollbackLog = await AuditLogs.findOne({
				where: { entity_type: "ReceivableDebts", entity_id: createdDebtId },
			});
			expect(afterRollbackLog).toBeNull();

			await recCust.destroy({ force: true, hooks: false });
		});
	});
});
