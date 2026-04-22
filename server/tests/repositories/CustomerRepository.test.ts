import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import { CompanyRepository } from '@/repositories/CompanyRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { ReceivableCustomers, PayableCustomers, Companies, Users } from '@/models';
import { ADMIN_USER_ID } from '@common/constants';

describe('CustomerRepository', () => {
  const TEST_COMPANY_NAME = 'TEST_CUST_REPO_CO_COMPREHENSIVE_V3';
  const TEST_USER_NAME = 'TEST_CUST_REPO_USER_COMPREHENSIVE_V3';
  let testCompanyId: string;
  let testUserId: string;

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
      created_by: ADMIN_USER_ID
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await ReceivableCustomers.destroy({ where: { company_id: testCompanyId }, force: true });
    await PayableCustomers.destroy({ where: { company_id: testCompanyId }, force: true });
    await Users.destroy({ where: { id: testUserId }, force: true });
    await Companies.destroy({ where: { id: testCompanyId }, force: true });
  });

  describe('Receivable Domain', () => {
    const repo = new CustomerRepository('receivable');

    it('create and update and delete should work', async () => {
      const customer = await repo.create({
        company_id: testCompanyId,
        name: 'CRUD Cust',
        is_company: true,
        created_by: testUserId
      });
      expect(customer.name.trim()).toBe('CRUD Cust');

      await repo.update(customer.id, testCompanyId, { phone: '12345' });
      const updated = await repo.findById(customer.id, testCompanyId);
      expect(updated?.phone).toBe('12345');

      await repo.delete(customer.id, testCompanyId, testUserId);
      const deleted = await repo.findById(customer.id, testCompanyId);
      expect(deleted).toBeNull();
    });

    it('findAllWithSummary should support complex filters and sorting', async () => {
        await repo.create({ company_id: testCompanyId, name: 'Filter A', is_company: true, created_by: testUserId, tax_office: 'OfficeX' });
        await repo.create({ company_id: testCompanyId, name: 'Filter B', is_company: false, created_by: testUserId });

        const isCompanyTrue = await repo.findAllWithSummary(testCompanyId, 10, 0, [], [{ id: 'is_company', value: 'true' }]);
        expect(isCompanyTrue.rows.some(r => r.name.trim() === 'Filter A')).toBe(true);

        const taxOfficeFilter = await repo.findAllWithSummary(testCompanyId, 10, 0, [], [{ id: 'tax_office', value: 'OfficeX' }]);
        expect(taxOfficeFilter.rows.length).toBe(1);

        const sortedByTax = await repo.findAllWithSummary(testCompanyId, 10, 0, [{ id: 'tax_office', desc: false }]);
        expect(sortedByTax.rows.length).toBeGreaterThanOrEqual(2);
        
        const debtStatus = await repo.findAllWithSummary(testCompanyId, 10, 0, [], [{ id: 'debt_status', value: 'HAS_NO_DEBT' }]);
        expect(debtStatus.count).toBeGreaterThan(0);
    });

    it('getStatement should support date filters', async () => {
        const cust = await repo.create({ company_id: testCompanyId, name: 'Statement Cust', is_company: true, created_by: testUserId });
        const statement = await repo.getStatement(cust.id, testCompanyId, '2020-01-01', '2030-01-01');
        expect(statement).not.toBeNull();
        expect(statement?.customer.name.trim()).toBe('Statement Cust');
    });

    it('findAllIdAndName should return results', async () => {
        const result = await repo.findAllIdAndName(testCompanyId);
        expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Payable Domain', () => {
    const repo = new CustomerRepository('payable');

    it('create and findById should work', async () => {
      const customer = await repo.create({
        company_id: testCompanyId,
        name: 'Payable Cust',
        is_company: false,
        created_by: testUserId
      });
      const found = await repo.findById(customer.id, testCompanyId);
      expect(found?.name.trim()).toBe('Payable Cust');
    });
  });
});
