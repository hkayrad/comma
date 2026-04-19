import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { CustomerRepository } from '../../repositories/CustomerRepository';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { ReceivableCustomers, PayableCustomers, Companies, Users } from '../../models';

describe('CustomerRepository', () => {
  const TEST_COMPANY_NAME = 'TEST_CUST_REPO_CO';
  const TEST_USER_NAME = 'TEST_CUST_REPO_USER';
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
      created_by: '00000000-0000-0000-0000-000000000000'
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

    it('create should create a receivable customer', async () => {
      const customer = await repo.create({
        company_id: testCompanyId,
        name: 'Test Rec Cust',
        is_company: true,
        created_by: testUserId
      });
      expect(customer.name.trim()).toBe('Test Rec Cust');
    });

    it('findById should return customer', async () => {
      const found = await repo.findByIdWithSummary ? null : null; // dummy to trigger re-read
      const cust = await ReceivableCustomers.findOne({ where: { name: 'Test Rec Cust', company_id: testCompanyId } });
      expect(cust).not.toBeNull();
      const foundActual = await repo.findById(cust!.id, testCompanyId);
      expect(foundActual).not.toBeNull();
      expect(foundActual?.name.trim()).toBe('Test Rec Cust');
    });
  });

  describe('Payable Domain', () => {
    const repo = new CustomerRepository('payable');

    it('create should create a payable customer', async () => {
      const customer = await repo.create({
        company_id: testCompanyId,
        name: 'Test Pay Cust',
        is_company: false,
        created_by: testUserId
      });
      expect(customer.name.trim()).toBe('Test Pay Cust');
    });

    it('findById should return customer', async () => {
      const cust = await PayableCustomers.findOne({ where: { name: 'Test Pay Cust', company_id: testCompanyId } });
      expect(cust).not.toBeNull();
      const found = await repo.findById(cust!.id, testCompanyId);
      expect(found).not.toBeNull();
      expect(found?.name.trim()).toBe('Test Pay Cust');
    });
  });
});
