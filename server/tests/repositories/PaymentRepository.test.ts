import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { PaymentRepository } from '../../repositories/PaymentRepository';
import { CustomerRepository } from '../../repositories/CustomerRepository';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { ReceivablePayments, PayablePayments, ReceivableCustomers, PayableCustomers, Companies, Users } from '../../models';

describe('PaymentRepository', () => {
  const TEST_COMPANY_NAME = 'TEST_PAY_REPO_CO';
  const TEST_USER_NAME = 'TEST_PAY_REPO_USER';
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
    await ReceivablePayments.destroy({ where: { company_id: testCompanyId }, force: true });
    await PayablePayments.destroy({ where: { company_id: testCompanyId }, force: true });
    await ReceivableCustomers.destroy({ where: { id: testRecCustId }, force: true });
    await PayableCustomers.destroy({ where: { id: testPayCustId }, force: true });
    await Users.destroy({ where: { id: testUserId }, force: true });
    await Companies.destroy({ where: { id: testCompanyId }, force: true });
  });

  describe('Receivable Domain', () => {
    const repo = new PaymentRepository('receivable');

    it('create should create a receivable payment', async () => {
      const payment = await repo.create({
        company_id: testCompanyId,
        customer_id: testRecCustId,
        invoice_no: 'INV-REC-P1',
        amount: 100,
        currency: 'TRY',
        exchange_rate: 1,
        amount_in_try: 100,
        payment_method: 'cash',
        payment_date: new Date(),
        created_by: testUserId
      });
      expect(payment.invoice_no).toBe('INV-REC-P1');
    });

    it('findById should return payment', async () => {
      const pay = await ReceivablePayments.findOne({ where: { invoice_no: 'INV-REC-P1' } });
      const found = await repo.findById(pay!.id, testCompanyId);
      expect(found?.invoice_no).toBe('INV-REC-P1');
    });
  });

  describe('Payable Domain', () => {
    const repo = new PaymentRepository('payable');

    it('create should create a payable payment', async () => {
      const payment = await repo.create({
        company_id: testCompanyId,
        customer_id: testPayCustId,
        invoice_no: 'INV-PAY-P1',
        amount: 200,
        currency: 'TRY',
        exchange_rate: 1,
        amount_in_try: 200,
        payment_method: 'bank_transfer',
        payment_date: new Date(),
        created_by: testUserId
      });
      expect(payment.invoice_no).toBe('INV-PAY-P1');
    });

    it('findById should return payment', async () => {
      const pay = await PayablePayments.findOne({ where: { invoice_no: 'INV-PAY-P1' } });
      const found = await repo.findById(pay!.id, testCompanyId);
      expect(found?.invoice_no).toBe('INV-PAY-P1');
    });
  });
});
