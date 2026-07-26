import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { AuditLogService } from "@/services/AuditLogService";
import { AuditLogRepository } from "@/repositories/AuditLogRepository";
import { CompanyRepository } from "@/repositories/CompanyRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { AuditLogs, Companies, Users } from "@/models";
import { sequelize } from "@/lib/db/sequelize";

describe("AuditLog Challenger M3_2: Transaction Propagation & Multi-Tenant Stress Test", () => {
	let companyA: string;
	let companyB: string;
	let companyC: string;
	let userA: string;
	let userB: string;
	let createdCompanyIds: string[] = [];

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
			) ENGINE=InnoDB;
		`);

		// Ensure audit_logs is using InnoDB engine for transactional integrity
		await sequelize.query(`ALTER TABLE audit_logs ENGINE=InnoDB;`);

		const cA = await Companies.create({ name: "CHALLENGE_CO_A", is_company: true }, { hooks: false });
		const cB = await Companies.create({ name: "CHALLENGE_CO_B", is_company: true }, { hooks: false });
		const cC = await Companies.create({ name: "CHALLENGE_CO_C", is_company: true }, { hooks: false });

		companyA = cA.id;
		companyB = cB.id;
		companyC = cC.id;
		createdCompanyIds = [companyA, companyB, companyC];

		const uA = await Users.create(
			{
				company_id: companyA,
				username: "challenge_user_a",
				pass_hash: "hash",
				role: 1,
				created_by: "00000000-0000-0000-0000-000000000000",
			},
			{ hooks: false }
		);
		const uB = await Users.create(
			{
				company_id: companyB,
				username: "challenge_user_b",
				pass_hash: "hash",
				role: 1,
				created_by: "00000000-0000-0000-0000-000000000000",
			},
			{ hooks: false }
		);

		userA = uA.id;
		userB = uB.id;
	});

	afterAll(async () => {
		if (createdCompanyIds.length > 0) {
			await AuditLogs.destroy({ where: { company_id: createdCompanyIds }, force: true });
			await Users.destroy({ where: { company_id: createdCompanyIds }, force: true });
			await Companies.destroy({ where: { id: createdCompanyIds }, force: true });
		}
	});

	describe("1. Transaction Propagation & Rollback Verification", () => {
		it("1a. Managed transaction commit: log recorded inside managed transaction is committed", async () => {
			let createdLogId: string = "";

			await sequelize.transaction(async (t) => {
				const log = await AuditLogService.recordAction(
					{
						company_id: companyA,
						user_id: userA,
						entity_type: "receivable_debts",
						entity_id: "50000000-0000-0000-0000-000000000001",
						action: "CREATE",
						new_values: { amount: 100 },
					},
					t
				);
				createdLogId = log.id;
			});

			const found = await AuditLogs.findByPk(createdLogId);
			expect(found).not.toBeNull();
			expect(found?.id).toBe(createdLogId);
			expect(found?.company_id).toBe(companyA);
		});

		it("1b. Managed transaction rollback: log recorded inside managed transaction that throws is rolled back", async () => {
			let createdLogId: string = "";

			try {
				await sequelize.transaction(async (t) => {
					const log = await AuditLogService.recordAction(
						{
							company_id: companyA,
							user_id: userA,
							entity_type: "receivable_debts",
							entity_id: "50000000-0000-0000-0000-000000000002",
							action: "CREATE",
							new_values: { amount: 200 },
						},
						t
					);
					createdLogId = log.id;
					throw new Error("Simulated managed transaction failure");
				});
			} catch (err: any) {
				expect(err.message).toBe("Simulated managed transaction failure");
			}

			expect(createdLogId).not.toBe("");
			const found = await AuditLogs.findByPk(createdLogId);
			expect(found).toBeNull();
		});

		it("1c. Managed transaction rollback: multiple logs in single transaction are all rolled back", async () => {
			const logIds: string[] = [];

			try {
				await sequelize.transaction(async (t) => {
					const log1 = await AuditLogService.recordAction(
						{
							company_id: companyA,
							user_id: userA,
							entity_type: "receivable_payments",
							entity_id: "50000000-0000-0000-0000-000000000003",
							action: "CREATE",
						},
						t
					);
					logIds.push(log1.id);

					const log2 = await AuditLogService.recordAction(
						{
							company_id: companyA,
							user_id: userA,
							entity_type: "receivable_payments",
							entity_id: "50000000-0000-0000-0000-000000000004",
							action: "UPDATE",
						},
						t
					);
					logIds.push(log2.id);

					throw new Error("Batch transaction rollback");
				});
			} catch (err: any) {
				expect(err).toBeDefined();
			}

			expect(logIds.length).toBeGreaterThan(0);
			const foundLogs = await AuditLogs.findAll({ where: { id: logIds } });
			expect(foundLogs.length).toBe(0);
		});

		it("1d. Unmanaged transaction commit: log recorded inside unmanaged transaction is committed when commit() is called", async () => {
			const t = await sequelize.transaction();

			const log = await AuditLogService.recordAction(
				{
					company_id: companyB,
					user_id: userB,
					entity_type: "payable_debts",
					entity_id: "60000000-0000-0000-0000-000000000001",
					action: "CREATE",
					new_values: { supplier: "Acme Corp" },
				},
				t
			);

			await t.commit();

			const found = await AuditLogs.findByPk(log.id);
			expect(found).not.toBeNull();
			expect(found?.company_id).toBe(companyB);
		});

		it("1e. Unmanaged transaction rollback: log recorded inside unmanaged transaction is discarded when rollback() is called", async () => {
			const t = await sequelize.transaction();

			const log = await AuditLogService.recordAction(
				{
					company_id: companyB,
					user_id: userB,
					entity_type: "payable_debts",
					entity_id: "60000000-0000-0000-0000-000000000002",
					action: "DELETE",
				},
				t
			);

			await t.rollback();

			const found = await AuditLogs.findByPk(log.id);
			expect(found).toBeNull();
		});

		it("1f. Unmanaged execution without transaction: records log immediately", async () => {
			const log = await AuditLogService.recordAction({
				company_id: companyC,
				entity_type: "companies",
				entity_id: companyC,
				action: "UPDATE",
				new_values: { updated_field: "test" },
			});

			const found = await AuditLogs.findByPk(log.id);
			expect(found).not.toBeNull();
			expect(found?.company_id).toBe(companyC);
		});
	});

	describe("2. Multi-Tenant Isolation & Concurrency Stress Testing", () => {
		it("2a. Heavy concurrent log creations across multiple companies with mixed rollback/commit operations", { timeout: 30000 }, async () => {
			const companies = [];
			for (let i = 1; i <= 5; i++) {
				const c = await Companies.create({ name: `CONCURRENCY_TEST_CO_${i}`, is_company: true }, { hooks: false });
				companies.push(c.id);
				createdCompanyIds.push(c.id);
			}

			const committedCountPerCompany = new Map<string, number>();
			companies.forEach((id) => committedCountPerCompany.set(id, 0));

			const concurrencyTasks: Promise<any>[] = [];

			for (const companyId of companies) {
				// 10 Direct creations
				for (let j = 0; j < 10; j++) {
					concurrencyTasks.push(
						(async () => {
							await AuditLogService.recordAction({
								company_id: companyId,
								entity_type: "receivable_debts",
								entity_id: `70000000-${companyId.substring(0, 4)}-0000-0000-0000000000${j}`,
								action: "CREATE",
								new_values: { idx: j },
							});
							committedCountPerCompany.set(companyId, committedCountPerCompany.get(companyId)! + 1);
						})()
					);
				}

				// 5 Managed transaction commits
				for (let j = 0; j < 5; j++) {
					concurrencyTasks.push(
						(async () => {
							await sequelize.transaction(async (t) => {
								await AuditLogService.recordAction(
									{
										company_id: companyId,
										entity_type: "payable_payments",
										entity_id: `80000000-${companyId.substring(0, 4)}-0000-0000-0000000000${j}`,
										action: "UPDATE",
										new_values: { status: "PAID" },
									},
									t
								);
							});
							committedCountPerCompany.set(companyId, committedCountPerCompany.get(companyId)! + 1);
						})()
					);
				}

				// 3 Managed transaction rollbacks
				for (let j = 0; j < 3; j++) {
					concurrencyTasks.push(
						(async () => {
							try {
								await sequelize.transaction(async (t) => {
									await AuditLogService.recordAction(
										{
											company_id: companyId,
											entity_type: "users",
											entity_id: `90000000-${companyId.substring(0, 4)}-0000-0000-0000000000${j}`,
											action: "DELETE",
										},
										t
									);
									throw new Error("Concurrent rollback trigger");
								});
							} catch (e) {
								// Expected rollback
							}
						})()
					);
				}
			}

			// Execute all 90 tasks concurrently
			await Promise.all(concurrencyTasks);

			// Verify tenant isolation for each company
			for (const companyId of companies) {
				const expectedCount = committedCountPerCompany.get(companyId)!;
				expect(expectedCount).toBe(15); // 10 direct + 5 managed commit

				const logsResult = await AuditLogService.getLogs(companyId, 1, 100);

				expect(logsResult.total).toBe(expectedCount);
				expect(logsResult.data.length).toBe(expectedCount);

				const isStrictlyIsolated = logsResult.data.every((log) => log.company_id === companyId);
				expect(isStrictlyIsolated).toBe(true);
			}
		});

		it("2b. Filter injection defense: filters attempting to specify or override company_id cannot breach tenant boundary", async () => {
			const filterAttempt1 = await AuditLogService.getLogs(companyA, 1, 50, [], [
				{ id: "company_id", value: companyB },
			]);

			expect(filterAttempt1.data.every((log) => log.company_id === companyA)).toBe(true);

			const filterAttempt2 = await AuditLogService.getLogs(companyA, 1, 50, [], [
				{ id: "company_id", value: [companyA, companyB] },
			]);

			expect(filterAttempt2.data.every((log) => log.company_id === companyA)).toBe(true);
		});

		it("2c. SQL / ORM Injection resistance in filter parameters", async () => {
			const maliciousFilters = [
				{ id: "entity_type", value: "receivable_debts' OR company_id = '" + companyB },
				{ id: "action", value: ["CREATE', 'UPDATE"] },
				{ id: "; DROP TABLE audit_logs; --", value: "test" },
			];

			const res = await AuditLogService.getLogs(companyA, 1, 50, [], maliciousFilters as any);
			expect(res.data.every((log) => log.company_id === companyA)).toBe(true);
		});
	});

	describe("3. Pagination & Sorting Edge Cases", () => {
		it("3a. Fallback to default sorting when non-whitelisted sort column is specified", async () => {
			const res = await AuditLogService.getLogs(companyA, 1, 10, [
				{ id: "non_existent_column", desc: true },
				{ id: "company_id; DROP TABLE audit_logs", desc: false },
			]);

			expect(res.data).toBeDefined();
			expect(Array.isArray(res.data)).toBe(true);
		});

		it("3b. Normalization of invalid page and limit values", async () => {
			const res = await AuditLogService.getLogs(companyA, -5, -100);
			expect(res.page).toBe(1);
			expect(res.limit).toBe(20);
		});
	});
});
