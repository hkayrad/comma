import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { UserRepository } from '@/repositories/UserRepository';
import { CompanyRepository } from '@/repositories/CompanyRepository';
import { Users, Companies, RefreshTokens } from '@/models';
import { UserRole } from '@comma/common/enums';
import { ADMIN_USER_ID } from '@comma/common/constants';

describe('UserRepository', () => {
  const TEST_USERNAME = 'TEST_REPO_USER_COMP';
  const TEST_COMPANY_NAME = 'TEST_REPO_COMPANY_COMP';
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

  it('create, update, delete should work', async () => {
    const user = await UserRepository.create({
      company_id: testCompanyId,
      username: TEST_USERNAME,
      pass_hash: 'hash',
      role: UserRole.USER,
      created_by: ADMIN_USER_ID
    });
    expect(user.username).toBe(TEST_USERNAME);

    await UserRepository.update(user.id, { role: UserRole.ADMIN });
    const found = await UserRepository.findById(user.id);
    expect(found?.role).toBe(UserRole.ADMIN);

    await UserRepository.delete(user.id, ADMIN_USER_ID);
    const deleted = await UserRepository.findById(user.id);
    expect(deleted).toBeNull();
  });

  it('findAllByCompany should support complex filters and sorting', async () => {
      const u1 = await UserRepository.create({ company_id: testCompanyId, username: 'U1', pass_hash: 'h', role: 1, created_by: ADMIN_USER_ID });
      const u2 = await UserRepository.create({ company_id: testCompanyId, username: 'U2', pass_hash: 'h', role: 2, created_by: ADMIN_USER_ID });

      const filteredByRole = await UserRepository.findAllByCompany(testCompanyId, 10, 0, [], [{ id: 'role', value: ['1'] }]);
      expect(filteredByRole.rows.some(r => r.username === 'U1')).toBe(true);
      expect(filteredByRole.rows.every(r => r.role === 1)).toBe(true);

      const filteredByUsername = await UserRepository.findAllByCompany(testCompanyId, 10, 0, [], [{ id: 'username', value: 'U2' }]);
      expect(filteredByUsername.rows[0].username).toBe('U2');

      const sortedByUsername = await UserRepository.findAllByCompany(testCompanyId, 10, 0, [{ id: 'username', desc: true }]);
      expect(sortedByUsername.rows[0].username).toBe('U2');
  });

  describe('Refresh Tokens', () => {
      it('should manage refresh tokens', async () => {
          const user = await UserRepository.create({ company_id: testCompanyId, username: 'T', pass_hash: 'h', role: 1, created_by: ADMIN_USER_ID });
          const tokenData = { user_id: user.id, token_hash: 'h1', expires_at: new Date(Date.now() + 10000) };

          await UserRepository.createRefreshToken(tokenData);
          const found = await UserRepository.findRefreshTokenByHash('h1');
          expect(found).not.toBeNull();

          await UserRepository.revokeAllRefreshTokens(user.id);
          const revoked = await UserRepository.findRefreshTokenByHash('h1');
          expect(revoked?.revoked).toBe(true);

          await UserRepository.deleteRefreshToken('h1');
          expect(await UserRepository.findRefreshTokenByHash('h1')).toBeNull();
      });

      it('should delete expired tokens', async () => {
          const user = await UserRepository.create({ company_id: testCompanyId, username: 'E', pass_hash: 'h', role: 1, created_by: ADMIN_USER_ID });
          await UserRepository.createRefreshToken({ user_id: user.id, token_hash: 'hexp', expires_at: new Date(Date.now() - 1000) });

          await UserRepository.deleteExpiredRefreshTokens(user.id);
          expect(await UserRepository.findRefreshTokenByHash('hexp')).toBeNull();
      });
  });
});
