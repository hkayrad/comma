import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TwoFactorService } from '@/services/TwoFactorService';
import { UserRepository } from '@/repositories/UserRepository';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

describe('TwoFactorService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.TOTP_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  describe('generateSecret', () => {
    it('should generate a base32 secret', () => {
      const secret = TwoFactorService.generateSecret();
      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
    });
  });

  describe('generateTOTPUri', () => {
      it('should generate uri', () => {
          const uri = TwoFactorService.generateTOTPUri('test', 'GEZDGNBVGY3TQOJQ');
          expect(uri).toContain('otpauth://totp/Comma:test');
      });
  });

  describe('generateQRCode', () => {
      it('should return data url', async () => {
          const result = await TwoFactorService.generateQRCode('uri');
          expect(result).toContain('data:image/png;base64');
      });

      it('should throw if QRCode.toDataURL fails', async () => {
          vi.spyOn(QRCode, 'toDataURL').mockRejectedValue(new Error('fail') as never);
          await expect(TwoFactorService.generateQRCode('uri')).rejects.toThrow('Failed to generate QR code');
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

    it('should throw error if format invalid', () => {
        expect(() => TwoFactorService.decryptSecret('a:b')).toThrow('Invalid encrypted secret format');
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
      });

      it('should hash and verify recovery codes', async () => {
          const codes = ['ABCDE-12345'];
          const hashed = await TwoFactorService.hashRecoveryCodes(codes);
          const index = await TwoFactorService.verifyRecoveryCode(hashed, 'ABCDE-12345');
          expect(index).toBe(0);
      });
  });

  describe('checkRateLimit', () => {
      it('should return false if user not found', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
          const result = await TwoFactorService.checkRateLimit('1');
          expect(result.locked).toBe(false);
      });

      it('should return locked if lockout_until is in future', async () => {
          const future = new Date(Date.now() + 10000);
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ totp_lockout_until: future } as any);
          const result = await TwoFactorService.checkRateLimit('1');
          expect(result.locked).toBe(true);
          expect(result.remainingTime).toBeGreaterThan(0);
      });
  });

  describe('incrementFailedAttempts', () => {
      it('should throw error if user not found', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
          await expect(TwoFactorService.incrementFailedAttempts('1')).rejects.toThrow('User not found');
      });

      it('should increment attempts', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ totp_failed_attempts: 0 } as any);
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);
          const result = await TwoFactorService.incrementFailedAttempts('1');
          expect(result.locked).toBe(false);
          expect(result.attemptsRemaining).toBe(4);
      });

      it('should lock after max attempts', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ totp_failed_attempts: 4 } as any);
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);
          const result = await TwoFactorService.incrementFailedAttempts('1');
          expect(result.locked).toBe(true);
      });
  });

  describe('resetFailedAttempts', () => {
      it('should clear attempts', async () => {
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);
          await TwoFactorService.resetFailedAttempts('1');
          expect(UserRepository.update).toHaveBeenCalledWith('1', { totp_failed_attempts: 0, totp_lockout_until: null });
      });
  });

  describe('initiateSetup', () => {
      it('should return QR code and secret', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ username: 'test' } as any);
          const result = await TwoFactorService.initiateSetup('1');
          expect(result.qrCode).toBeDefined();
          expect(result.secret).toBeDefined();
      });

      it('should throw if user not found', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
          await expect(TwoFactorService.initiateSetup('1')).rejects.toThrow('User not found');
      });
  });

  describe('completeSetup', () => {
      it('should return failure for invalid token', async () => {
          const result = await TwoFactorService.completeSetup('1', 'SECRET', 'wrong');
          expect(result.success).toBe(false);
      });

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

  describe('verifyLogin', () => {
    it('should return failure if user not found or 2fa disabled', async () => {
        vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
        const result = await TwoFactorService.verifyLogin('1', '123456');
        expect(result.success).toBe(false);
    });

    it('should return failure if already locked', async () => {
        const future = new Date(Date.now() + 10000);
        vi.spyOn(UserRepository, 'findById').mockResolvedValue({ totp_lockout_until: future } as any);
        const result = await TwoFactorService.verifyLogin('1', '123456');
        expect(result.locked).toBe(true);
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

    it('should return failure for invalid token', async () => {
        const secret = TwoFactorService.generateSecret();
        const encryptedSecret = TwoFactorService.encryptSecret(secret);
        vi.spyOn(UserRepository, 'findById').mockResolvedValue({ 
            id: '1', totp_enabled: true, totp_secret: encryptedSecret, totp_failed_attempts: 0 
        } as any);
        vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

        const result = await TwoFactorService.verifyLogin('1', '000000');
        expect(result.success).toBe(false);
        expect(UserRepository.update).toHaveBeenCalled();
    });
  });

  describe('useRecoveryCode', () => {
      it('should use recovery code and update', async () => {
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

      it('should return failure for wrong code', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ 
              totp_recovery_codes: JSON.stringify(['hash']), totp_failed_attempts: 0 
          } as any);
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

          const result = await TwoFactorService.useRecoveryCode('1', 'WRONG');
          expect(result.success).toBe(false);
      });

      it('should return failure if user has no recovery codes', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ totp_recovery_codes: null } as any);
          const result = await TwoFactorService.useRecoveryCode('1', 'X');
          expect(result.success).toBe(false);
      });
  });

  describe('disable', () => {
      it('should return failure if user not found', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
          const result = await TwoFactorService.disable('1', 'pass');
          expect(result.success).toBe(false);
      });

      it('should return failure if no secret', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: '1', totp_secret: null } as any);
          const result = await TwoFactorService.disable('1', 'pass');
          expect(result.success).toBe(false);
      });

      it('should disable if password matches', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: '1', totp_secret: 's', pass_hash: 'h' } as any);
          vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

          const result = await TwoFactorService.disable('1', 'pass');
          expect(result.success).toBe(true);
      });

      it('should return failure if password wrong', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: '1', totp_secret: 's', pass_hash: 'h' } as any);
          vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

          const result = await TwoFactorService.disable('1', 'wrong');
          expect(result.success).toBe(false);
      });
  });

  describe('isEnabled', () => {
      it('should return status', async () => {
          vi.spyOn(UserRepository, 'findById').mockResolvedValue({ totp_enabled: true } as any);
          expect(await TwoFactorService.isEnabled('1')).toBe(true);
      });
  });
});
