import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyManagementService } from '@/services/Admin/CompanyManagementService';
import { CompanyRepository } from '@/repositories/CompanyRepository';
import { NotFoundError, ValidationError } from '@/lib/errors/AppError';

describe('CompanyManagementService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Create', () => {
    it('should throw ValidationError if name is missing', async () => {
      await expect(CompanyManagementService.Create({} as any)).rejects.toThrow(ValidationError);
    });

    it('should create company and return id', async () => {
      vi.spyOn(CompanyRepository, 'create').mockResolvedValue({ id: 'new-id' } as any);
      const result = await CompanyManagementService.Create({ name: 'Test' } as any);
      expect(result).toBe('new-id');
    });
  });

  describe('GetAll', () => {
    it('should return paginated companies', async () => {
      const mockResult = { rows: [], count: 0 };
      vi.spyOn(CompanyRepository, 'findAllWithPagination').mockResolvedValue(mockResult);
      const result = await CompanyManagementService.GetAll(0, 10);
      expect(result).toEqual(mockResult);
    });
  });

  describe('GetById', () => {
    it('should throw NotFoundError if not found', async () => {
      vi.spyOn(CompanyRepository, 'findById').mockResolvedValue(null);
      await expect(CompanyManagementService.GetById('1')).rejects.toThrow(NotFoundError);
    });

    it('should return company if found', async () => {
      vi.spyOn(CompanyRepository, 'findById').mockResolvedValue({ name: 'Test' } as any);
      const result = await CompanyManagementService.GetById('1');
      expect(result.name).toBe('Test');
    });
  });

  describe('Update', () => {
    it('should update company and return updated object', async () => {
      vi.spyOn(CompanyRepository, 'update').mockResolvedValue([1]);
      vi.spyOn(CompanyRepository, 'findById').mockResolvedValue({ name: 'Updated' } as any);
      const result = await CompanyManagementService.Update("1", { name: "Updated" } as any);
      expect(result?.name).toBe("Updated");
    });

    it('should throw NotFoundError if affectedRows is 0 and company not found', async () => {
      vi.spyOn(CompanyRepository, 'update').mockResolvedValue([0]);
      vi.spyOn(CompanyRepository, 'findById').mockResolvedValue(null);
      await expect(CompanyManagementService.Update('1', { name: 'Test' } as any)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Delete', () => {
    it('should delete company', async () => {
      vi.spyOn(CompanyRepository, 'delete').mockResolvedValue(1);
      await CompanyManagementService.Delete('1');
      expect(CompanyRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError if nothing deleted', async () => {
      vi.spyOn(CompanyRepository, 'delete').mockResolvedValue(0);
      await expect(CompanyManagementService.Delete('1')).rejects.toThrow(NotFoundError);
    });
  });
});
