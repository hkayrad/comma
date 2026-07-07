import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { DebtRepository } from '@/repositories/DebtRepository';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import { CompanyRepository } from '@/repositories/CompanyRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { ReceivableDebts, PayableDebts, ReceivableCustomers, PayableCustomers, Companies, Users } from '@/models';
import { ADMIN_USER_ID } from '@comma/common/constants';

describe('DebtRepository', () => {
  const TEST_COMPANY_NAME = 'TEST_DEBT_REPO_CO_COMP_V4';
  const TEST_USER_NAME = 'TEST_DEBT_REPO_USER_COMP_V4';
  let testCompanyId: string;
  let testUserId: string;
  let testRecCustId: string;

  beforeAll(async () => {
    const company = await CompanyRepository.create({ name: TEST_COMPANY_NAME, is_company: true });
    testCompanyId = company.id;
    const user = await UserRepository.create({ company_id: testCompanyId, username: TEST_USER_NAME, pass_hash: 'h', role: 1, created_by: ADMIN_USER_ID });
    testUserId = user.id;
    const recCust = await new CustomerRepository('receivable').create({ company_id: testCompanyId, name: 'C', is_company: true, created_by: testUserId });
    testRecCustId = recCust.id;
  });

  afterAll(async () => {
    await ReceivableDebts.destroy({ where: { company_id: testCompanyId }, force: true });
    await ReceivableCustomers.destroy({ where: { company_id: testCompanyId }, force: true });
    await Users.destroy({ where: { id: testUserId }, force: true });
    await Companies.destroy({ where: { id: testCompanyId }, force: true });
  });

  describe('Receivable Domain', () => {
    const repo = new DebtRepository('receivable');

    it('create, update, delete should work', async () => {
      const debt = await repo.create({ company_id: testCompanyId, customer_id: testRecCustId, invoice_no: 'INV-X', amount: 100, vat: 20, currency: 'TRY', exchange_rate: 1, total: 120, total_in_try: 120, issue_date: new Date(), created_by: testUserId });
      expect(debt.invoice_no).toBe('INV-X');

      await repo.update(debt.id, testCompanyId, { description: 'Updated' });
      const updated = await repo.findById(debt.id, testCompanyId);
      expect(updated?.description).toBe('Updated');

      await repo.delete(debt.id, testCompanyId, testUserId);
      const deleted = await repo.findById(debt.id, testCompanyId);
      expect(deleted).toBeNull();
    });

    it('findAllWithSummary should support filters and sorting', async () => {
        await repo.create({ company_id: testCompanyId, customer_id: testRecCustId, invoice_no: 'INV-FILTER', amount: 100, vat: 20, currency: 'USD', exchange_rate: 1, total: 120, total_in_try: 120, issue_date: new Date(), created_by: testUserId });
        
        const filteredByInvoice = await repo.findAllWithSummary(testCompanyId, 10, 0, [], [{ id: 'invoice_no', value: 'INV-FILTER' }]);
        expect(filteredByInvoice.rows.length).toBe(1);

        const filteredByCurrency = await repo.findAllWithSummary(testCompanyId, 10, 0, [], [{ id: 'currency', value: ['USD'] }]);
        expect(filteredByCurrency.rows.length).toBe(1);

        const sortedByAmount = await repo.findAllWithSummary(testCompanyId, 10, 0, [{ id: 'amount', desc: true }]);
        expect(sortedByAmount.rows.length).toBeGreaterThan(0);

        const invalidSort = await repo.findAllWithSummary(testCompanyId, 10, 0, [{ id: 'amount', desc: true }]);
        expect(invalidSort.rows.length).toBeGreaterThan(0);
    });

    it('getTotals and getUpcomingDueDates and getMonthlyStats should work', async () => {
        await repo.getTotals(testCompanyId, 'TRY');
        await repo.getUpcomingDueDates(testCompanyId);
        await repo.getMonthlyStats(testCompanyId, new Date(), new Date());
    });

    it('should correctly calculate total and total_in_try with withholding and discount', async () => {
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5);

        const debt = await repo.create({
            company_id: testCompanyId,
            customer_id: testRecCustId,
            invoice_no: 'INV-CALC',
            amount: 100,
            vat: 20,
            discount: 10,
            withholding: 5,
            currency: 'USD',
            exchange_rate: 2.0,
            issue_date: issueDate,
            due_date: dueDate,
            created_by: testUserId
        });

        // 1. Verify Sequelize virtual fields
        expect(Number(debt.total)).toBe(105);
        expect(Number(debt.total_in_try)).toBe(210);

        // 2. Verify findAllWithSummary totals
        const summary = await repo.findAllWithSummary(testCompanyId, 10, 0, [], [{ id: 'invoice_no', value: 'INV-CALC' }]);
        const row = summary.rows.find(r => r.id === debt.id);
        expect(row).toBeDefined();
        expect(Number(row?.total)).toBe(105);
        expect(Number(row?.total_in_try)).toBe(210);

        // 3. Verify getTotals
        const totals = await repo.getTotals(testCompanyId, 'TRY');
        expect(totals).not.toBeNull();
        // Since other test cases also create debts, let's verify that totals is at least 210
        expect(totals?.total_debts).toBeGreaterThanOrEqual(210);

        // 4. Verify getUpcomingDueDates
        const upcoming = await repo.getUpcomingDueDates(testCompanyId, 7);
        const upcomingItem = upcoming.find(u => u.id === debt.id);
        expect(upcomingItem).toBeDefined();
        expect(Number(upcomingItem?.total)).toBe(105);

        // 5. Verify getMonthlyStats
        const start = new Date();
        start.setDate(1);
        const end = new Date();
        end.setMonth(end.getMonth() + 1);
        end.setDate(1);
        const stats = await repo.getMonthlyStats(testCompanyId, start, end);
        expect(stats.length).toBeGreaterThan(0);
        const currentMonthStr = issueDate.toISOString().slice(0, 7);
        const currentMonthStats = stats.find(s => s.month === currentMonthStr);
        expect(currentMonthStats).toBeDefined();
        expect(Number(currentMonthStats?.total)).toBeGreaterThanOrEqual(105);
    });
  });
});
