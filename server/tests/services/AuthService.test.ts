import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../../services/AuthService';
import { UserRepository } from '../../repositories/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sequelize } from '../../lib/db/sequelize';
import { Transaction } from 'sequelize';

describe('AuthService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_ISSUER = 'test_issuer';
    process.env.JWT_AUDIENCE = 'test_audience';
    process.env.JWT_EXPIRES_IN = '7';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Login', () => {
    it('should return failure if user not found', async () => {
      vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue(null);
      
      const promise = AuthService.Login('nonexistent', 'pass');
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid username or password');
    });

    it('should return failure if password does not match', async () => {
        vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue({ pass_hash: 'hash' } as any);
        vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        const promise = AuthService.Login('test', 'wrong');
        vi.runAllTimers();
        const result = await promise;

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid username or password');
    });

    it('should return success and tokens for valid credentials', async () => {
      const mockUser = {
        id: '1',
        company_id: '1',
        username: 'test',
        pass_hash: 'hash',
        role: 1,
        totp_enabled: false
      };
      vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue(mockUser as any);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.spyOn(UserRepository, 'createRefreshToken').mockResolvedValue({} as any);
      vi.spyOn(UserRepository, 'deleteExpiredRefreshTokens').mockResolvedValue(0);

      const promise = AuthService.Login('test', 'pass');
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
    });

    it('should handle cleanup error gracefully', async () => {
        const mockUser = { id: '1', company_id: '1', username: 'test', pass_hash: 'h', role: 1, totp_enabled: false };
        vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue(mockUser as any);
        vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
        vi.spyOn(UserRepository, 'deleteExpiredRefreshTokens').mockRejectedValue(new Error('Cleanup fail'));
        vi.spyOn(UserRepository, 'createRefreshToken').mockResolvedValue({} as any);

        const promise = AuthService.Login('test', 'pass');
        vi.runAllTimers();
        const result = await promise;
        expect(result.success).toBe(true);
    });

    it('should return requires2FA if enabled', async () => {
      const mockUser = {
        id: '1',
        username: 'test',
        pass_hash: 'hash',
        totp_enabled: true
      };
      vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue(mockUser as any);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const promise = AuthService.Login('test', 'pass');
      vi.runAllTimers();
      const result = await promise;

      expect(result.requires2FA).toBe(true);
    });

    it('should catch errors and return failure', async () => {
        vi.spyOn(UserRepository, 'findByUsername').mockRejectedValue(new Error('DB Error'));
        const promise = AuthService.Login('test', 'pass');
        vi.runAllTimers();
        const result = await promise;
        expect(result.success).toBe(false);
    });
  });

  describe('Complete2FALogin', () => {
    it('should return failure if user not found', async () => {
        vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
        const result = await AuthService.Complete2FALogin('1');
        expect(result.success).toBe(false);
    });

    it('should return success and tokens if user found', async () => {
        const mockUser = { id: '1', company_id: '1', username: 'test', role: 1 };
        vi.spyOn(UserRepository, 'findById').mockResolvedValue(mockUser as any);
        vi.spyOn(UserRepository, 'deleteExpiredRefreshTokens').mockResolvedValue(0);
        vi.spyOn(UserRepository, 'createRefreshToken').mockResolvedValue({} as any);

        const result = await AuthService.Complete2FALogin('1');
        expect(result.success).toBe(true);
    });

    it('should handle cleanup error in 2fa login', async () => {
        const mockUser = { id: '1', company_id: '1', username: 'test', role: 1 };
        vi.spyOn(UserRepository, 'findById').mockResolvedValue(mockUser as any);
        vi.spyOn(UserRepository, 'deleteExpiredRefreshTokens').mockRejectedValue(new Error('fail'));
        vi.spyOn(UserRepository, 'createRefreshToken').mockResolvedValue({} as any);

        const result = await AuthService.Complete2FALogin('1');
        expect(result.success).toBe(true);
    });

    it('should catch errors and return failure', async () => {
        vi.spyOn(UserRepository, 'findById').mockRejectedValue(new Error('fail'));
        const result = await AuthService.Complete2FALogin('1');
        expect(result.success).toBe(false);
    });
  });

  describe('RefreshToken', () => {
    it('should return failure if token not found', async () => {
        vi.spyOn(sequelize, 'transaction').mockImplementation(async (cb: any) => cb());
        vi.spyOn(UserRepository, 'findRefreshTokenByHash').mockResolvedValue(null);
        const result = await AuthService.RefreshToken('token');
        expect(result.success).toBe(false);
    });

    it('should detect reuse and revoke all tokens', async () => {
        vi.spyOn(sequelize, 'transaction').mockImplementation(async (cb: any) => cb());
        const mockToken = { revoked: true, user_id: '1' };
        vi.spyOn(UserRepository, 'findRefreshTokenByHash').mockResolvedValue(mockToken as any);
        vi.spyOn(UserRepository, 'revokeAllRefreshTokens').mockResolvedValue([1] as any);

        const result = await AuthService.RefreshToken('token');
        expect(result.success).toBe(false);
        expect(result.message).toMatch(/Token reuse detected/);
        expect(UserRepository.revokeAllRefreshTokens).toHaveBeenCalledWith('1', undefined);
    });

    it('should return failure if token expired', async () => {
        vi.spyOn(sequelize, 'transaction').mockImplementation(async (cb: any) => cb());
        const mockToken = { revoked: false, expires_at: new Date(Date.now() - 1000), destroy: vi.fn() };
        vi.spyOn(UserRepository, 'findRefreshTokenByHash').mockResolvedValue(mockToken as any);

        const result = await AuthService.RefreshToken('token');
        expect(result.success).toBe(false);
        expect(result.message).toBe('Refresh token expired');
        expect(mockToken.destroy).toHaveBeenCalled();
    });

    it('should return failure if user not found for token', async () => {
        vi.spyOn(sequelize, 'transaction').mockImplementation(async (cb: any) => cb());
        vi.spyOn(UserRepository, 'findRefreshTokenByHash').mockResolvedValue({ user_id: '1', revoked: false, expires_at: new Date(Date.now()+10000) } as any);
        vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
        const result = await AuthService.RefreshToken('token');
        expect(result.success).toBe(false);
        expect(result.message).toBe('User not found');
    });

    it('should rotate tokens and return success', async () => {
        vi.spyOn(sequelize, 'transaction').mockImplementation(async (cb: any) => cb());
        const mockToken = { 
            revoked: false, 
            expires_at: new Date(Date.now() + 10000), 
            user_id: '1',
            save: vi.fn().mockResolvedValue({})
        };
        const mockUser = { id: '1', company_id: '1', username: 'test', role: 1 };
        
        vi.spyOn(UserRepository, 'findRefreshTokenByHash').mockResolvedValue(mockToken as any);
        vi.spyOn(UserRepository, 'findById').mockResolvedValue(mockUser as any);
        vi.spyOn(UserRepository, 'createRefreshToken').mockResolvedValue({} as any);

        const result = await AuthService.RefreshToken('token');
        expect(result.success).toBe(true);
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(mockToken.revoked).toBe(true);
        expect(mockToken.save).toHaveBeenCalled();
    });

    it('should catch errors and return failure', async () => {
        vi.spyOn(sequelize, 'transaction').mockRejectedValue(new Error('fail'));
        const result = await AuthService.RefreshToken('token');
        expect(result.success).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should call deleteRefreshToken and return true', async () => {
      vi.spyOn(UserRepository, 'deleteRefreshToken').mockResolvedValue(1);
      const result = await AuthService.Logout('token');
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
        vi.spyOn(UserRepository, 'deleteRefreshToken').mockRejectedValue(new Error('error'));
        const result = await AuthService.Logout('token');
        expect(result).toBe(false);
    });
  });
});
