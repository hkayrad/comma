import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../../services/AuthService';
import { UserRepository } from '../../repositories/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_ISSUER = 'test_issuer';
    process.env.JWT_AUDIENCE = 'test_audience';
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
      expect(result.refreshToken).toBeDefined();
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
      expect(result.tempToken).toBeDefined();
    });
  });

  describe('Logout', () => {
    it('should call deleteRefreshToken', async () => {
      vi.spyOn(UserRepository, 'deleteRefreshToken').mockResolvedValue(1);
      const result = await AuthService.Logout('token');
      expect(result).toBe(true);
      expect(UserRepository.deleteRefreshToken).toHaveBeenCalled();
    });
  });
});
