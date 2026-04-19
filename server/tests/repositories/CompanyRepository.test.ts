import { describe, it, expect, afterAll } from 'vitest';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import { Companies } from '../../models';

describe('CompanyRepository', () => {
  const TEST_NAME = 'UNIQUE_REPO_CO_NAME_V4';

  afterAll(async () => {
    await Companies.destroy({ where: { name: TEST_NAME }, force: true });
  });

  it('create should create a company', async () => {
    const company = await CompanyRepository.create({
      name: TEST_NAME,
      is_company: true
    });
    expect(company.name).toBe(TEST_NAME);
  });

  it('findById should return company', async () => {
    const company = await Companies.findOne({ where: { name: TEST_NAME } });
    const found = await CompanyRepository.findById(company!.id);
    expect(found?.name).toBe(TEST_NAME);
  });

  it('findByIdWithSpecificFields should return only requested fields', async () => {
      const company = await Companies.findOne({ where: { name: TEST_NAME } });
      const found = await CompanyRepository.findByIdWithSpecificFields(company!.id, ['name']);
      expect(found?.name).toBe(TEST_NAME);
      // @ts-ignore
      expect(found?.email).toBeUndefined();
  });

  it('update should update company', async () => {
    const company = await Companies.findOne({ where: { name: TEST_NAME } });
    await CompanyRepository.update(company!.id, { email: 'test@test.com' });
    const updated = await CompanyRepository.findById(company!.id);
    expect(updated?.email).toBe('test@test.com');
  });

  it('findAllWithPagination should support complex filters and sorting', async () => {
    const result = await CompanyRepository.findAllWithPagination(10, 0, [], [{ id: 'name', value: TEST_NAME }]);
    expect(result.count).toBeGreaterThan(0);
    expect(result.rows[0].name).toBe(TEST_NAME);

    const isCoResult = await CompanyRepository.findAllWithPagination(10, 0, [], [{ id: 'is_company', value: ['1'] }]);
    expect(isCoResult.count).toBeGreaterThan(0);

    const emailResult = await CompanyRepository.findAllWithPagination(10, 0, [], [{ id: 'email', value: 'test@test.com' }]);
    expect(emailResult.rows.some(r => r.name === TEST_NAME)).toBe(true);

    const sortedByEmail = await CompanyRepository.findAllWithPagination(10, 0, [{ id: 'email', desc: true }]);
    expect(sortedByEmail.rows.length).toBeGreaterThan(0);

    const invalidSort = await CompanyRepository.findAllWithPagination(10, 0, [{ id: 'invalid', desc: true }]);
    expect(invalidSort.rows.length).toBeGreaterThan(0);
  });

  it('delete should remove company', async () => {
      const company = await CompanyRepository.create({ name: 'TO_DELETE_REPO', is_company: false });
      await CompanyRepository.delete(company.id);
      const found = await CompanyRepository.findById(company.id);
      expect(found).toBeNull();
  });
});
