import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { PaymentRepository } from '@/repositories/PaymentRepository';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import { CompanyRepository } from '@/repositories/CompanyRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { ReceivablePayments, PayablePayments, ReceivableCustomers, PayableCustomers, Companies, Users } from '@/models';
import { ADMIN_USER_ID } from '@common/constants';

describe('PaymentRepository', () => {
  const TEST_COMPANY_NAME = 'TEST_PAY_REPO_CO_COMP';
  const TEST_USER_NAME = 'TEST_PAY_REPO_USER_COMP';
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
    await ReceivablePayments.destroy({ where: { company_id: testCompanyId }, force: true });
    await ReceivableCustomers.destroy({ where: { company_id: testCompanyId }, force: true });
    await Users.destroy({ where: { id: testUserId }, force: true });
    await Companies.destroy({ where: { id: testCompanyId }, force: true });
  });

  describe('Receivable Domain', () => {
    const repo = new PaymentRepository('receivable');

    it('create, update, delete should work', async () => {
      const payment = await repo.create({ company_id: testCompanyId, customer_id: testRecCustId, invoice_no: 'INV-P-X', amount: 100, currency: 'TRY', exchange_rate: 1, amount_in_try: 100, payment_method: 'cash', payment_date: new Date(), created_by: testUserId });
      expect(payment.invoice_no).toBe('INV-P-X');

      await repo.update(payment.id, testCompanyId, { description: 'Updated' });
      const updated = await repo.findById(payment.id, testCompanyId);
      expect(updated?.description).toBe('Updated');

      await repo.delete(payment.id, testCompanyId, testUserId);
      const deleted = await repo.findById(payment.id, testCompanyId);
      expect(deleted).toBeNull();
    });

    it('findAllWithPagination should support filters and sorting', async () => {
        await repo.create({ company_id: testCompanyId, customer_id: testRecCustId, invoice_no: 'INV-P-FILTER', amount: 100, currency: 'EUR', exchange_rate: 1, amount_in_try: 100, payment_method: 'check', payment_date: new Date(), created_by: testUserId });
        
        const filteredByInvoice = await repo.findAllWithPagination(testCompanyId, 10, 0, [], [{ id: 'invoice_no', value: 'INV-P-FILTER' }]);
        expect(filteredByInvoice.rows.length).toBe(1);

        const filteredByMethod = await repo.findAllWithPagination(testCompanyId, 10, 0, [], [{ id: 'payment_method', value: ['check'] }]);
        expect(filteredByMethod.rows.length).toBe(1);

        const sortedByDate = await repo.findAllWithPagination(testCompanyId, 10, 0, [{ id: 'payment_date', desc: true }]);
        expect(sortedByDate.rows.length).toBeGreaterThan(0);
    });
  });
});
