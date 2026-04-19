import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { UserRepository } from '../../repositories/UserRepository';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import { Users, Companies } from '../../models';

describe('UserRepository', () => {
  const TEST_USERNAME = 'TEST_REPO_USER';
  const TEST_COMPANY_NAME = 'TEST_REPO_COMPANY';
  let testCompanyId: string;

  beforeAll(async () => {
    const company = await CompanyRepository.create({
      name: TEST_COMPANY_NAME,
      is_company: true
    });
    testCompanyId = company.id;
  });

  afterAll(async () => {
    await Users.destroy({ where: { username: TEST_USERNAME }, force: true });
    await Companies.destroy({ where: { id: testCompanyId }, force: true });
  });

  it('create should create a user', async () => {
    const user = await UserRepository.create({
      company_id: testCompanyId,
      username: TEST_USERNAME,
      pass_hash: 'hash',
      role: 1,
      created_by: 'system'
    });

    expect(user.username).toBe(TEST_USERNAME);
  });

  it('findByUsername should return user', async () => {
    const user = await UserRepository.findByUsername(TEST_USERNAME);
    expect(user?.username).toBe(TEST_USERNAME);
  });

  it('findById should return user', async () => {
    const user = await UserRepository.findByUsername(TEST_USERNAME);
    const found = await UserRepository.findById(user!.id);
    expect(found?.username).toBe(TEST_USERNAME);
  });

  it('update should update user', async () => {
    const user = await UserRepository.findByUsername(TEST_USERNAME);
    await UserRepository.update(user!.id, { role: 99 });
    const updated = await UserRepository.findById(user!.id);
    expect(updated?.role).toBe(99);
  });
});
