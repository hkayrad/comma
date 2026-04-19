import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TwoFactorService } from '../../services/TwoFactorService';
import { UserRepository } from '../../repositories/UserRepository';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as OTPAuth from 'otpauth';

describe('TwoFactorService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateSecret', () => {
    it('should generate a base32 secret', () => {
      const secret = TwoFactorService.generateSecret();
      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
    });
  });

  describe('Encryption/Decryption', () => {
    it('should encrypt and decrypt a secret', () => {
      const secret = 'MY_SECRET';
      const encrypted = TwoFactorService.encryptSecret(secret);
      expect(encrypted).toContain(':');
      
      const decrypted = TwoFactorService.decryptSecret(encrypted);
      expect(decrypted).toBe(secret);
    });
  });

  describe('verifyToken', () => {
      it('should verify a valid token', () => {
          const secret = TwoFactorService.generateSecret();
          const totp = new OTPAuth.TOTP({
              secret: OTPAuth.Secret.fromBase32(secret)
          });
          const token = totp.generate();
          expect(TwoFactorService.verifyToken(secret, token)).toBe(true);
      });

      it('should return false for invalid token', () => {
          expect(TwoFactorService.verifyToken('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', '123456')).toBe(false);
      });
  });

  describe('Recovery Codes', () => {
      it('should generate recovery codes', () => {
          const codes = TwoFactorService.generateRecoveryCodes(5);
          expect(codes).toHaveLength(5);
          expect(codes[0]).toMatch(/^[A-Z0-9]{5}-[A-Z0-9]{5}$/);
      });

      it('should hash and verify recovery codes', async () => {
          const codes = ['ABCDE-12345'];
          const hashed = await TwoFactorService.hashRecoveryCodes(codes);
          const index = await TwoFactorService.verifyRecoveryCode(hashed, 'ABCDE-12345');
          expect(index).toBe(0);
          
          const index2 = await TwoFactorService.verifyRecoveryCode(hashed, 'WRONG');
          expect(index2).toBe(-1);
      });
  });

  describe('initiateSetup', () => {
      it('should return QR code and secret', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ username: 'test' } as any);
          const result = await TwoFactorService.initiateSetup('1');
          expect(result.qrCode).toContain('data:image/png;base64');
          expect(result.secret).toBeDefined();
      });
  });

  describe('completeSetup', () => {
      it('should return success and recovery codes', async () => {
          const secret = TwoFactorService.generateSecret();
          const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret) });
          const token = totp.generate();

          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

          const result = await TwoFactorService.completeSetup('1', secret, token);
          expect(result.success).toBe(true);
          expect(result.recoveryCodes).toHaveLength(10);
      });
  });

  describe('Rate Limiting & Lockout', () => {
      it('checkRateLimit should return locked if lockout_until is in future', async () => {
          const future = new Date(Date.now() + 10000);
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ totp_lockout_until: future } as any);
          const result = await TwoFactorService.checkRateLimit('1');
          expect(result.locked).toBe(true);
          expect(result.remainingTime).toBeGreaterThan(0);
      });

      it('incrementFailedAttempts should lock after MAX attempts', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ totp_failed_attempts: 4 } as any);
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);
          const result = await TwoFactorService.incrementFailedAttempts('1');
          expect(result.locked).toBe(true);
          expect(UserRepository.update).toHaveBeenCalledWith('1', expect.objectContaining({ totp_lockout_until: expect.any(Date) }));
      });

      it('resetFailedAttempts should clear attempts', async () => {
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);
          await TwoFactorService.resetFailedAttempts('1');
          expect(UserRepository.update).toHaveBeenCalledWith('1', { totp_failed_attempts: 0, totp_lockout_until: null });
      });
  });

  describe('verifyLogin', () => {
      it('should return failure if user not found or 2fa disabled', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
          const result = await TwoFactorService.verifyLogin('1', '123456');
          expect(result.success).toBe(false);
      });

      it('should return success for valid token', async () => {
          const secret = TwoFactorService.generateSecret();
          const encryptedSecret = TwoFactorService.encryptSecret(secret);
          const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret) });
          const token = totp.generate();

          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ 
              id: '1', totp_enabled: true, totp_secret: encryptedSecret 
          } as any);
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

          const result = await TwoFactorService.verifyLogin('1', token);
          expect(result.success).toBe(true);
      });

      it('should handle invalid token and increment attempts', async () => {
          const secret = TwoFactorService.generateSecret();
          const encryptedSecret = TwoFactorService.encryptSecret(secret);
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ 
              id: '1', totp_enabled: true, totp_secret: encryptedSecret, totp_failed_attempts: 0 
          } as any);
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

          const result = await TwoFactorService.verifyLogin('1', '000000');
          expect(result.success).toBe(false);
          expect(UserRepository.update).toHaveBeenCalledWith('1', { totp_failed_attempts: 1 });
      });
  });

  describe('useRecoveryCode', () => {
      it('should return success for valid recovery code', async () => {
          const codes = ['ABCDE-12345'];
          const hashed = await TwoFactorService.hashRecoveryCodes(codes);
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ 
              totp_recovery_codes: JSON.stringify(hashed) 
          } as any);
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

          const result = await TwoFactorService.useRecoveryCode('1', 'ABCDE-12345');
          expect(result.success).toBe(true);
          expect(result.remainingCodes).toBe(0);
      });

      it('should return failure for invalid recovery code', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ 
              totp_recovery_codes: JSON.stringify(['hash']), totp_failed_attempts: 0 
          } as any);
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

          const result = await TwoFactorService.useRecoveryCode('1', 'WRONG');
          expect(result.success).toBe(false);
      });
  });

  describe('disable', () => {
      it('should return success if password matches', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ 
              pass_hash: 'hash', totp_secret: 'secret' 
          } as any);
          vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

          const result = await TwoFactorService.disable('1', 'password');
          expect(result.success).toBe(true);
      });

      it('should return failure if password incorrect', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ 
              pass_hash: 'hash', totp_secret: 'secret' 
          } as any);
          vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

          const result = await TwoFactorService.disable('1', 'wrong');
          expect(result.success).toBe(false);
      });
  });
});
