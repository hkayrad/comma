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

const parseJson = (val: any) => (typeof val === "string" ? JSON.parse(val) : val);

describe("Milestone 4 Empirical Stress & Transaction Atomicity Verification", () => {
	let companyId: string;
	let userId: string;

	beforeAll(async () => {
		// Ensure audit_logs table structure in test environment
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
			{ name: "M4_STRESS_CO", is_company: true },
			{ hooks: false }
		);
		companyId = comp.id;

		const user = await Users.create(
			{
				company_id: companyId,
				username: "m4_stress_user",
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

	describe("1. High-Volume Model Mutation Stress Performance", () => {
		it("should execute 50 model creations and updates under audit logging, recording 100 audit logs accurately", async () => {
			const numRecords = 50;
			const createdCustomers: any[] = [];

			const startTimeWithHooks = Date.now();

			// Batch creation with individual hooks enabled
			for (let i = 0; i < numRecords; i++) {
				const cust = await ReceivableCustomers.create(
					{
						company_id: companyId,
						name: `Stress Cust ${i}`,
						created_by: userId,
					},
					{ user_id: userId, ip_address: "192.168.1.100", user_agent: "BenchmarkingAgent/1.0" }
				);
				createdCustomers.push(cust);
			}

			// Batch update with individual hooks enabled
			for (let i = 0; i < numRecords; i++) {
				await createdCustomers[i].update(
					{ name: `Stress Cust ${i} Updated` },
					{ user_id: userId, ip_address: "192.168.1.101" }
				);
			}

			const durationWithHooks = Date.now() - startTimeWithHooks;

			// Check total audit logs generated
			const totalLogs = await AuditLogs.count({
				where: { company_id: companyId, entity_type: "ReceivableCustomers" },
			});
			expect(totalLogs).toBe(numRecords * 2);

			const createLogsCount = await AuditLogs.count({
				where: { company_id: companyId, entity_type: "ReceivableCustomers", action: "CREATE" },
			});
			expect(createLogsCount).toBe(numRecords);

			const updateLogsCount = await AuditLogs.count({
				where: { company_id: companyId, entity_type: "ReceivableCustomers", action: "UPDATE" },
			});
			expect(updateLogsCount).toBe(numRecords);

			// Verify sample payload details
			const sampleUpdateLog = await AuditLogs.findOne({
				where: { entity_type: "ReceivableCustomers", entity_id: createdCustomers[0].id, action: "UPDATE" },
			});
			expect(sampleUpdateLog).not.toBeNull();
			expect(sampleUpdateLog?.ip_address).toBe("192.168.1.101");
			expect(parseJson(sampleUpdateLog?.old_values)).toHaveProperty("name", "Stress Cust 0");
			expect(parseJson(sampleUpdateLog?.new_values)).toHaveProperty("name", "Stress Cust 0 Updated");

			console.log(`[Stress Bench] 50 creates + 50 updates with hooks completed in ${durationWithHooks}ms (${((numRecords * 2) / (durationWithHooks / 1000)).toFixed(1)} ops/sec)`);

			// Cleanup created test records
			for (const cust of createdCustomers) {
				await cust.destroy({ force: true, hooks: false });
			}
		}, 30000);

		it("should measure performance overhead comparing model updates with vs without audit hooks", async () => {
			const count = 30;

			// Benchmark WITH audit hooks
			const startWith = Date.now();
			const withHooksCusts: any[] = [];
			for (let i = 0; i < count; i++) {
				const c = await PayableCustomers.create(
					{ company_id: companyId, name: `Bench With ${i}`, created_by: userId },
					{ user_id: userId }
				);
				withHooksCusts.push(c);
			}
			for (let i = 0; i < count; i++) {
				await withHooksCusts[i].update({ name: `Bench With ${i} Mod` }, { user_id: userId });
			}
			const durationWith = Date.now() - startWith;

			// Benchmark WITHOUT audit hooks
			const startWithout = Date.now();
			const withoutHooksCusts: any[] = [];
			for (let i = 0; i < count; i++) {
				const c = await PayableCustomers.create(
					{ company_id: companyId, name: `Bench W/O ${i}`, created_by: userId },
					{ hooks: false }
				);
				withoutHooksCusts.push(c);
			}
			for (let i = 0; i < count; i++) {
				await withoutHooksCusts[i].update({ name: `Bench W/O ${i} Mod` }, { hooks: false });
			}
			const durationWithout = Date.now() - startWithout;

			console.log(`[Overhead Bench] 60 ops (30 create + 30 update): With hooks = ${durationWith}ms, Without hooks = ${durationWithout}ms (Hook overhead per operation: ${((durationWith - durationWithout) / (count * 2)).toFixed(2)}ms)`);
			expect(durationWith).toBeGreaterThan(0);
			expect(durationWithout).toBeGreaterThan(0);

			// Cleanup
			for (const c of withHooksCusts) await c.destroy({ force: true, hooks: false });
			for (const c of withoutHooksCusts) await c.destroy({ force: true, hooks: false });
		}, 30000);
	});

	describe("2. Complex Multi-Model Transaction Atomicity & Rollback", () => {
		it("should commit audit logs atomically when a multi-model transaction succeeds", async () => {
			let debtId = "";
			let paymentId = "";
			let custId = "";

			await sequelize.transaction(async (t) => {
				const cust = await ReceivableCustomers.create(
					{ company_id: companyId, name: "Tx Atomicity Cust", created_by: userId },
					{ transaction: t, user_id: userId }
				);
				custId = cust.id;

				const debt = await ReceivableDebts.create(
					{
						company_id: companyId,
						customer_id: cust.id,
						amount: 5000,
						vat: 1000,
						issue_date: new Date(),
						created_by: userId,
					},
					{ transaction: t, user_id: userId }
				);
				debtId = debt.id;

				const payment = await ReceivablePayments.create(
					{
						company_id: companyId,
						customer_id: cust.id,
						amount: 2500,
						payment_date: new Date(),
						created_by: userId,
					},
					{ transaction: t, user_id: userId }
				);
				paymentId = payment.id;
			});

			// Verify all 3 audit logs are committed to DB
			const logs = await AuditLogs.findAll({
				where: {
					company_id: companyId,
					entity_id: [custId, debtId, paymentId],
				},
			});

			expect(logs.length).toBe(3);
			const entities = logs.map((l) => l.entity_type).sort();
			expect(entities).toEqual(["ReceivableCustomers", "ReceivableDebts", "ReceivablePayments"].sort());

			// Cleanup
			await ReceivablePayments.destroy({ where: { id: paymentId }, force: true, hooks: false });
			await ReceivableDebts.destroy({ where: { id: debtId }, force: true, hooks: false });
			await ReceivableCustomers.destroy({ where: { id: custId }, force: true, hooks: false });
		}, 30000);

		it("should roll back ALL audit logs atomically when a multi-model transaction fails at step 3 of 3", async () => {
			let debtId = "";
			let paymentId = "";
			let custId = "";

			try {
				await sequelize.transaction(async (t) => {
					const cust = await ReceivableCustomers.create(
						{ company_id: companyId, name: "Tx Fail Cust", created_by: userId },
						{ transaction: t, user_id: userId }
					);
					custId = cust.id;

					const debt = await ReceivableDebts.create(
						{
							company_id: companyId,
							customer_id: cust.id,
							amount: 5000,
							vat: 1000,
							issue_date: new Date(),
							created_by: userId,
						},
						{ transaction: t, user_id: userId }
					);
					debtId = debt.id;

					// Verify logs exist inside transaction snapshot
					const inTxCustLog = await AuditLogs.findOne({
						where: { entity_id: custId },
						transaction: t,
					});
					expect(inTxCustLog).not.toBeNull();

					// Throw error halfway through to force transaction abort
					throw new Error("Simulated Business Rule Failure in Step 3");
				});
			} catch (err: any) {
				expect(err.message).toBe("Simulated Business Rule Failure in Step 3");
			}

			// Verify NO audit logs committed for any step
			const rolledBackLogs = await AuditLogs.findAll({
				where: {
					company_id: companyId,
					entity_id: [custId, debtId],
				},
			});

			expect(rolledBackLogs.length).toBe(0);

			// Verify main entities were also rolled back
			const rolledBackCust = await ReceivableCustomers.findByPk(custId);
			expect(rolledBackCust).toBeNull();
			const rolledBackDebt = await ReceivableDebts.findByPk(debtId);
			expect(rolledBackDebt).toBeNull();
		}, 30000);

		it("should roll back audit logs in unmanaged transactions when rollback() is explicitly called", async () => {
			const t = await sequelize.transaction();

			const user = await Users.create(
				{
					company_id: companyId,
					username: "unmanaged_tx_user",
					pass_hash: "hash",
					role: 2,
					created_by: userId,
				},
				{ transaction: t, user_id: userId }
			);

			const inTxLog = await AuditLogs.findOne({
				where: { entity_id: user.id },
				transaction: t,
			});
			expect(inTxLog).not.toBeNull();

			// Abort unmanaged transaction
			await t.rollback();

			const postRollbackLog = await AuditLogs.findOne({
				where: { entity_id: user.id },
			});
			expect(postRollbackLog).toBeNull();

			const postRollbackUser = await Users.findByPk(user.id);
			expect(postRollbackUser).toBeNull();
		}, 30000);
	});

	describe("3. Audit Logging Across All 8 Target Models", () => {
		it("should verify full mutation lifecycle (CREATE, UPDATE, DELETE, RESTORE) across all 8 target models", async () => {
			// 1. Companies
			const co = await Companies.create(
				{ name: "Lifecycle Co", is_company: true },
				{ user_id: userId }
			);
			await co.update({ name: "Lifecycle Co Mod" }, { user_id: userId });
			await co.destroy({ user_id: userId });
			await co.restore({ user_id: userId });

			const coLogs = await AuditLogs.findAll({ where: { entity_type: "Companies", entity_id: co.id } });
			expect(coLogs.map((l) => l.action).sort()).toEqual(["CREATE", "UPDATE", "DELETE", "RESTORE"].sort());
			await co.destroy({ force: true, hooks: false });

			// 2. Users
			const u = await Users.create(
				{ company_id: companyId, username: "life_u", pass_hash: "h", role: 1, created_by: userId },
				{ user_id: userId }
			);
			await u.update({ username: "life_u_mod" }, { user_id: userId });
			await u.destroy({ user_id: userId });
			await u.restore({ user_id: userId });

			const uLogs = await AuditLogs.findAll({ where: { entity_type: "Users", entity_id: u.id } });
			expect(uLogs.map((l) => l.action).sort()).toEqual(["CREATE", "UPDATE", "DELETE", "RESTORE"].sort());
			await u.destroy({ force: true, hooks: false });

			// 3. ReceivableCustomers
			const rc = await ReceivableCustomers.create(
				{ company_id: companyId, name: "life_rc", created_by: userId },
				{ user_id: userId }
			);
			await rc.update({ name: "life_rc_mod" }, { user_id: userId });
			await rc.destroy({ user_id: userId });
			await rc.restore({ user_id: userId });

			const rcLogs = await AuditLogs.findAll({ where: { entity_type: "ReceivableCustomers", entity_id: rc.id } });
			expect(rcLogs.map((l) => l.action).sort()).toEqual(["CREATE", "UPDATE", "DELETE", "RESTORE"].sort());
			await rc.destroy({ force: true, hooks: false });

			// 4. PayableCustomers
			const pc = await PayableCustomers.create(
				{ company_id: companyId, name: "life_pc", created_by: userId },
				{ user_id: userId }
			);
			await pc.update({ name: "life_pc_mod" }, { user_id: userId });
			await pc.destroy({ user_id: userId });
			await pc.restore({ user_id: userId });

			const pcLogs = await AuditLogs.findAll({ where: { entity_type: "PayableCustomers", entity_id: pc.id } });
			expect(pcLogs.map((l) => l.action).sort()).toEqual(["CREATE", "UPDATE", "DELETE", "RESTORE"].sort());
			await pc.destroy({ force: true, hooks: false });

			// Setup parent customer for debt and payment models
			const parentRc = await ReceivableCustomers.create(
				{ company_id: companyId, name: "parent_rc", created_by: userId },
				{ hooks: false }
			);
			const parentPc = await PayableCustomers.create(
				{ company_id: companyId, name: "parent_pc", created_by: userId },
				{ hooks: false }
			);

			// 5. ReceivableDebts
			const rd = await ReceivableDebts.create(
				{ company_id: companyId, customer_id: parentRc.id, amount: 100, vat: 10, issue_date: new Date(), created_by: userId },
				{ user_id: userId }
			);
			await rd.update({ amount: 150 }, { user_id: userId });
			await rd.destroy({ user_id: userId });
			await rd.restore({ user_id: userId });

			const rdLogs = await AuditLogs.findAll({ where: { entity_type: "ReceivableDebts", entity_id: rd.id } });
			expect(rdLogs.map((l) => l.action).sort()).toEqual(["CREATE", "UPDATE", "DELETE", "RESTORE"].sort());
			await rd.destroy({ force: true, hooks: false });

			// 6. PayableDebts
			const pd = await PayableDebts.create(
				{ company_id: companyId, customer_id: parentPc.id, amount: 200, vat: 20, issue_date: new Date(), created_by: userId },
				{ user_id: userId }
			);
			await pd.update({ amount: 250 }, { user_id: userId });
			await pd.destroy({ user_id: userId });
			await pd.restore({ user_id: userId });

			const pdLogs = await AuditLogs.findAll({ where: { entity_type: "PayableDebts", entity_id: pd.id } });
			expect(pdLogs.map((l) => l.action).sort()).toEqual(["CREATE", "UPDATE", "DELETE", "RESTORE"].sort());
			await pd.destroy({ force: true, hooks: false });

			// 7. ReceivablePayments
			const rp = await ReceivablePayments.create(
				{ company_id: companyId, customer_id: parentRc.id, amount: 50, payment_date: new Date(), created_by: userId },
				{ user_id: userId }
			);
			await rp.update({ amount: 75 }, { user_id: userId });
			await rp.destroy({ user_id: userId });
			await rp.restore({ user_id: userId });

			const rpLogs = await AuditLogs.findAll({ where: { entity_type: "ReceivablePayments", entity_id: rp.id } });
			expect(rpLogs.map((l) => l.action).sort()).toEqual(["CREATE", "UPDATE", "DELETE", "RESTORE"].sort());
			await rp.destroy({ force: true, hooks: false });

			// 8. PayablePayments
			const pp = await PayablePayments.create(
				{ company_id: companyId, customer_id: parentPc.id, amount: 80, payment_date: new Date(), created_by: userId },
				{ user_id: userId }
			);
			await pp.update({ amount: 90 }, { user_id: userId });
			await pp.destroy({ user_id: userId });
			await pp.restore({ user_id: userId });

			const ppLogs = await AuditLogs.findAll({ where: { entity_type: "PayablePayments", entity_id: pp.id } });
			expect(ppLogs.map((l) => l.action).sort()).toEqual(["CREATE", "UPDATE", "DELETE", "RESTORE"].sort());
			await pp.destroy({ force: true, hooks: false });

			await parentRc.destroy({ force: true, hooks: false });
			await parentPc.destroy({ force: true, hooks: false });
		}, 30000);
	});
});
