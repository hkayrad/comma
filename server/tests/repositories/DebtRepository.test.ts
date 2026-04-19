import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { DebtRepository } from '../../repositories/DebtRepository';
import { CustomerRepository } from '../../repositories/CustomerRepository';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import { ReceivableDebts, PayableDebts, ReceivableCustomers, PayableCustomers, Companies } from '../../models';

describe('DebtRepository', () => {
  const TEST_COMPANY_NAME = 'TEST_DEBT_REPO_CO';
  let testCompanyId: string;
  let testRecCustId: string;
  let testPayCustId: string;

  beforeAll(async () => {
    const company = await CompanyRepository.create({
      name: TEST_COMPANY_NAME,
      is_company: true
    });
    testCompanyId = company.id;

    const recCust = await new CustomerRepository('receivable').create({
      company_id: testCompanyId,
      name: 'Test Rec Cust',
      is_company: true,
      created_by: 'system'
    });
    testRecCustId = recCust.id;

    const payCust = await new CustomerRepository('payable').create({
      company_id: testCompanyId,
      name: 'Test Pay Cust',
      is_company: false,
      created_by: 'system'
    });
    testPayCustId = payCust.id;
  });

  afterAll(async () => {
    await ReceivableDebts.destroy({ where: { company_id: testCompanyId }, force: true });
    await PayableDebts.destroy({ where: { company_id: testCompanyId }, force: true });
    await ReceivableCustomers.destroy({ where: { id: testRecCustId }, force: true });
    await PayableCustomers.destroy({ where: { id: testPayCustId }, force: true });
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
        created_by: 'system'
      });
      expect(debt.invoice_no).toBe('INV-REC-1');
    });

    it('findById should return debt', async () => {
      const debt = await ReceivableDebts.findOne({ where: { invoice_no: 'INV-REC-1' } });
      const found = await repo.findById(debt!.id, testCompanyId);
      expect(found?.invoice_no).toBe('INV-REC-1');
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
        created_by: 'system'
      });
      expect(debt.invoice_no).toBe('INV-PAY-1');
    });

    it('findById should return debt', async () => {
      const debt = await PayableDebts.findOne({ where: { invoice_no: 'INV-PAY-1' } });
      const found = await repo.findById(debt!.id, testCompanyId);
      expect(found?.invoice_no).toBe('INV-PAY-1');
    });
  });
});
