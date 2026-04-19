import { describe, it, expect, afterAll } from 'vitest';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import { Companies } from '../../models';

describe('CompanyRepository', () => {
  const TEST_NAME = 'TEST_REPO_CO';

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

  it('update should update company', async () => {
    const company = await Companies.findOne({ where: { name: TEST_NAME } });
    await CompanyRepository.update(company!.id, { email: 'test@test.com' });
    const updated = await CompanyRepository.findById(company!.id);
    expect(updated?.email).toBe('test@test.com');
  });

  it('findAllWithPagination should return companies', async () => {
    const result = await CompanyRepository.findAllWithPagination(10, 0);
    expect(result.count).toBeGreaterThan(0);
    expect(result.rows.length).toBeGreaterThan(0);
  });
});
