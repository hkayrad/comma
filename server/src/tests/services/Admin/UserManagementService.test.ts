import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserManagementService } from '@/services/Admin/UserManagementService';
import { UserRepository } from '@/repositories/UserRepository';
import bcrypt from 'bcrypt';
import { NotFoundError, ValidationError } from '@/lib/errors/AppError';

describe('UserManagementService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Default mock for findById to return a standard mock user
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: '1',
      company_id: '1',
      username: 'test-user',
      role: 1,
      created_at: new Date(),
      created_by: 'admin-id',
      updated_at: new Date(),
      deleted_at: null,
    } as any);
  });

  describe('Create', () => {
    it('should throw ValidationError if required fields missing', async () => {
      await expect(UserManagementService.Create({} as any, 'admin-id'))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if username exists', async () => {
      vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue({ id: '1' } as any);
      await expect(UserManagementService.Create({ company_id: '1', username: 'exists', password: 'p' } as any, 'admin-id'))
        .rejects.toThrow(ValidationError);
    });

    it('should create user successfully', async () => {
      vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue(null);
      vi.spyOn(bcrypt, 'hash').mockResolvedValue('hash' as never);
      vi.spyOn(UserRepository, 'create').mockResolvedValue({ id: 'new-id' } as any);

      const result = await UserManagementService.Create({ company_id: '1', username: 'new', password: 'p' } as any, 'admin-id');
      expect(result).toBe('new-id');
    });
  });

  describe('GetAllByCompany', () => {
      it('should return users for a company', async () => {
          const mockResult = { rows: [], count: 0 };
          vi.spyOn(UserRepository, 'findAllByCompany').mockResolvedValue(mockResult);
          const result = await UserManagementService.GetAllByCompany('1', 0, 10);
          expect(result).toEqual(mockResult);
      });
  });

  describe('GetById', () => {
    it('should throw NotFoundError if user not found', async () => {
      vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
      await expect(UserManagementService.GetById('1')).rejects.toThrow(NotFoundError);
    });

    it('should return user DTO', async () => {
      const mockUser = { id: '1', username: 'test', deleted_at: null };
      vi.spyOn(UserRepository, 'findById').mockResolvedValue(mockUser as any);
      const result = await UserManagementService.GetById('1');
      expect(result.username).toBe('test');
    });
  });

  describe('Update', () => {
      it('should update user', async () => {
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);
          const result = await UserManagementService.Update('1', { role: 1 }, 'admin-id');
          expect(result.id).toBe('1');
      });

      it('should throw ValidationError if username already taken by another user', async () => {
          vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue({ id: '2' } as any);
          await expect(UserManagementService.Update('1', { username: 'taken' }, 'admin-id'))
            .rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError if no update data provided', async () => {
          await expect(UserManagementService.Update('1', {}, 'admin-id'))
            .rejects.toThrow(ValidationError);
      });

      it('should throw NotFoundError if user not found during update', async () => {
          vi.spyOn(UserRepository, 'update').mockResolvedValue([0]);
          vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
          await expect(UserManagementService.Update('1', { role: 1 }, 'admin-id'))
            .rejects.toThrow(NotFoundError);
      });
  });

  describe('Delete', () => {
      it('should delete user', async () => {
          vi.spyOn(UserRepository, 'delete').mockResolvedValue(1);
          await UserManagementService.Delete('1', 'admin-id');
          expect(UserRepository.delete).toHaveBeenCalledWith('1', 'admin-id');
      });

      it('should throw NotFoundError if not deleted', async () => {
          vi.spyOn(UserRepository, 'delete').mockResolvedValue(0);
          await expect(UserManagementService.Delete('1', 'admin-id')).rejects.toThrow(NotFoundError);
      });
  });

  describe('Restore', () => {
      it('should restore user', async () => {
          vi.spyOn(UserRepository, 'restore').mockResolvedValue(1);
          await UserManagementService.Restore('1');
          expect(UserRepository.restore).toHaveBeenCalledWith('1');
      });

      it('should throw NotFoundError if not restored', async () => {
          vi.spyOn(UserRepository, 'restore').mockResolvedValue(0);
          await expect(UserManagementService.Restore('1')).rejects.toThrow(NotFoundError);
      });
  });

  describe('ResetPassword', () => {
      it('should reset password successfully', async () => {
          vi.spyOn(UserRepository, 'update').mockResolvedValue([1]);
          vi.spyOn(bcrypt, 'hash').mockResolvedValue('new-hash' as never);
          await UserManagementService.ResetPassword('1', 'new-pass');
          expect(UserRepository.update).toHaveBeenCalledWith('1', { pass_hash: 'new-hash' });
      });

      it('should throw NotFoundError if user not found during reset', async () => {
          vi.spyOn(UserRepository, 'update').mockResolvedValue([0]);
          vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
          await expect(UserManagementService.ResetPassword('1', 'new-pass')).rejects.toThrow(NotFoundError);
      });
  });
});
