import { describe, it, expect, afterAll } from 'vitest';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import { Companies } from '../../models';

describe('CompanyRepository', () => {
  const TEST_NAME = 'UNIQUE_REPO_CO_NAME';

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

  it('findAllWithPagination should return companies with filtering', async () => {
    const result = await CompanyRepository.findAllWithPagination(10, 0, [], [{ id: 'name', value: TEST_NAME }]);
    expect(result.count).toBeGreaterThan(0);
    expect(result.rows[0].name).toBe(TEST_NAME);

    const typeResult = await CompanyRepository.findAllWithPagination(10, 0, [], [{ id: 'is_company', value: 1 }]);
    expect(typeResult.count).toBeGreaterThan(0);
  });

  it('delete should remove company', async () => {
      const company = await CompanyRepository.create({ name: 'TO_DELETE', is_company: false });
      await CompanyRepository.delete(company.id);
      const found = await CompanyRepository.findById(company.id);
      expect(found).toBeNull();
  });
});
