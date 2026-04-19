import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { DebtRepository } from '../../repositories/DebtRepository';
import { CustomerRepository } from '../../repositories/CustomerRepository';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { ReceivableDebts, PayableDebts, ReceivableCustomers, PayableCustomers, Companies, Users } from '../../models';

describe('DebtRepository', () => {
  const TEST_COMPANY_NAME = 'TEST_DEBT_REPO_CO';
  const TEST_USER_NAME = 'TEST_DEBT_REPO_USER';
  let testCompanyId: string;
  let testUserId: string;
  let testRecCustId: string;
  let testPayCustId: string;

  beforeAll(async () => {
    const company = await CompanyRepository.create({
      name: TEST_COMPANY_NAME,
      is_company: true
    });
    testCompanyId = company.id;

    const user = await UserRepository.create({
        company_id: testCompanyId,
        username: TEST_USER_NAME,
        pass_hash: 'hash',
        role: 1,
        created_by: '00000000-0000-0000-0000-000000000000'
    });
    testUserId = user.id;

    const recCust = await new CustomerRepository('receivable').create({
      company_id: testCompanyId,
      name: 'Test Rec Cust',
      is_company: true,
      created_by: testUserId
    });
    testRecCustId = recCust.id;

    const payCust = await new CustomerRepository('payable').create({
      company_id: testCompanyId,
      name: 'Test Pay Cust',
      is_company: false,
      created_by: testUserId
    });
    testPayCustId = payCust.id;
  });

  afterAll(async () => {
    await ReceivableDebts.destroy({ where: { company_id: testCompanyId }, force: true });
    await PayableDebts.destroy({ where: { company_id: testCompanyId }, force: true });
    await ReceivableCustomers.destroy({ where: { id: testRecCustId }, force: true });
    await PayableCustomers.destroy({ where: { id: testPayCustId }, force: true });
    await Users.destroy({ where: { id: testUserId }, force: true });
    await Companies.destroy({ where: { id: testCompanyId }, force: true });
  });

  describe('Receivable Domain', () => {
    const repo = new DebtRepository('receivable');

    it('create should create a receivable debt', async () => {
      const debt = await repo.create({
        company_id: testCompanyId,
        customer_id: testRecCustId,
        invoice_no: 'INV-REC-1',
        amount: 100,
        vat: 20,
        currency: 'TRY',
        exchange_rate: 1,
        total: 120,
        total_in_try: 120,
        issue_date: new Date(),
        created_by: testUserId
      });
      expect(debt.invoice_no).toBe('INV-REC-1');
    });

    it('findById should return debt', async () => {
      const debt = await ReceivableDebts.findOne({ where: { invoice_no: 'INV-REC-1', company_id: testCompanyId } });
      const found = await repo.findById(debt!.id, testCompanyId);
      expect(found?.invoice_no).toBe('INV-REC-1');
    });

    it('findAllWithSummary should return debts with summary', async () => {
        const result = await repo.findAllWithSummary(testCompanyId, 10, 0, [], [{ id: 'invoice_no', value: 'INV-REC-1' }]);
        expect(result.count).toBeGreaterThan(0);
        expect(result.rows[0].invoice_no).toBe('INV-REC-1');
    });

    it('getTotals should return totals', async () => {
        const result = await repo.getTotals(testCompanyId, 'TRY');
        expect(result).not.toBeNull();
    });

    it('getUpcomingDueDates should return upcoming debts', async () => {
        const result = await repo.getUpcomingDueDates(testCompanyId);
        expect(Array.isArray(result)).toBe(true);
    });

    it('getMonthlyStats should return monthly stats', async () => {
        const start = new Date('2026-01-01');
        const end = new Date('2026-12-31');
        const result = await repo.getMonthlyStats(testCompanyId, start, end);
        expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Payable Domain', () => {
    const repo = new DebtRepository('payable');

    it('create should create a payable debt', async () => {
      const debt = await repo.create({
        company_id: testCompanyId,
        customer_id: testPayCustId,
        invoice_no: 'INV-PAY-1',
        amount: 200,
        vat: 40,
        currency: 'TRY',
        exchange_rate: 1,
        total: 240,
        total_in_try: 240,
        issue_date: new Date(),
        created_by: testUserId
      });
      expect(debt.invoice_no).toBe('INV-PAY-1');
    });

    it('findById should return debt', async () => {
      const debt = await PayableDebts.findOne({ where: { invoice_no: 'INV-PAY-1', company_id: testCompanyId } });
      const found = await repo.findById(debt!.id, testCompanyId);
      expect(found?.invoice_no).toBe('INV-PAY-1');
    });
  });
});
