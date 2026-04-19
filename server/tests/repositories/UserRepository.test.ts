import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { UserRepository } from '../../repositories/UserRepository';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import { Users, Companies, RefreshTokens } from '../../models';

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
    await RefreshTokens.destroy({ where: {}, force: true });
    await Users.destroy({ where: { username: TEST_USERNAME }, force: true });
    await Companies.destroy({ where: { id: testCompanyId }, force: true });
  });

  it('create should create a user', async () => {
    const user = await UserRepository.create({
      company_id: testCompanyId,
      username: TEST_USERNAME,
      pass_hash: 'hash',
      role: 1,
      created_by: '00000000-0000-0000-0000-000000000000'
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

  it('findAllByCompany should return users with pagination and filtering', async () => {
      const result = await UserRepository.findAllByCompany(testCompanyId, 10, 0, [], [{ id: 'username', value: TEST_USERNAME }]);
      expect(result.count).toBeGreaterThan(0);
      expect(result.rows[0].username).toBe(TEST_USERNAME);
      
      const roleResult = await UserRepository.findAllByCompany(testCompanyId, 10, 0, [], [{ id: 'role', value: 99 }]);
      expect(roleResult.count).toBeGreaterThan(0);
  });

  describe('Refresh Tokens', () => {
      it('should manage refresh tokens', async () => {
          const user = await UserRepository.findByUsername(TEST_USERNAME);
          const tokenData = {
              user_id: user!.id,
              token_hash: 'test-hash',
              expires_at: new Date(Date.now() + 10000)
          };

          await UserRepository.createRefreshToken(tokenData);
          const found = await UserRepository.findRefreshTokenByHash('test-hash');
          expect(found).not.toBeNull();
          expect(found?.user_id).toBe(user!.id);

          await UserRepository.revokeAllRefreshTokens(user!.id);
          const revoked = await UserRepository.findRefreshTokenByHash('test-hash');
          expect(revoked?.revoked).toBe(true);

          await UserRepository.deleteRefreshToken('test-hash');
          const deleted = await UserRepository.findRefreshTokenByHash('test-hash');
          expect(deleted).toBeNull();
      });

      it('should delete expired tokens', async () => {
          const user = await UserRepository.findByUsername(TEST_USERNAME);
          await UserRepository.createRefreshToken({
              user_id: user!.id,
              token_hash: 'expired-hash',
              expires_at: new Date(Date.now() - 1000)
          });

          await UserRepository.deleteExpiredRefreshTokens(user!.id);
          const found = await UserRepository.findRefreshTokenByHash('expired-hash');
          expect(found).toBeNull();
      });
  });
});
