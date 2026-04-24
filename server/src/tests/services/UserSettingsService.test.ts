import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserSettingsService } from '@/services/UserSettingsService';
import { UserRepository } from '@/repositories/UserRepository';
import bcrypt from 'bcrypt';
import { NotFoundError, UnauthorizedError, ValidationError } from '@/lib/errors/AppError';

describe('UserSettingsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('UpdateUsername', () => {
    it('should throw NotFoundError if user not found', async () => {
      vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
      await expect(UserSettingsService.UpdateUsername('1', 'new', 'pass'))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError if password incorrect', async () => {
      vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: '1', pass_hash: 'hash' } as any);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      await expect(UserSettingsService.UpdateUsername('1', 'new', 'wrong'))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw ValidationError if username taken', async () => {
      vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: '1', pass_hash: 'hash' } as any);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue({ id: '2', username: 'taken' } as any);
      
      await expect(UserSettingsService.UpdateUsername('1', 'taken', 'pass'))
        .rejects.toThrow(ValidationError);
    });

    it('should update username successfully', async () => {
      vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: '1', pass_hash: 'hash' } as any);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue(null);
      vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

      await UserSettingsService.UpdateUsername('1', 'new', 'pass');
      expect(UserRepository.update).toHaveBeenCalledWith('1', { username: 'new' });
    });
  });

  describe('UpdatePassword', () => {
    it('should update password successfully', async () => {
      vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: '1', pass_hash: 'oldhash' } as any);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.spyOn(bcrypt, 'hash').mockResolvedValue('newhash' as never);
      vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);

      await UserSettingsService.UpdatePassword('1', 'oldpass', 'newpass');
      expect(UserRepository.update).toHaveBeenCalledWith('1', { pass_hash: 'newhash' });
    });
  });
});
