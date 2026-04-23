import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayableCustomersService from '@/services/Payable/CustomersService';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import { NotFoundError, ValidationError } from '@/lib/errors/AppError';

describe('PayableCustomersService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d470';
  const validUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d471';

  describe('Create', () => {
    it('should throw ValidationError if name missing', async () => {
      await expect(PayableCustomersService.Create({} as any, validUserId, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should create customer and return id', async () => {
      vi.spyOn(CustomerRepository.prototype, 'create').mockResolvedValue({ id: 'new-id' } as any);
      const result = await PayableCustomersService.Create({ name: 'Test', is_company: true } as any, validUserId, validCompanyId);
      expect(result).toBe('new-id');
    });
  });

  describe('GetAll', () => {
    it('should return paginated results', async () => {
      const mockResult = { rows: [], count: 0 };
      vi.spyOn(CustomerRepository.prototype, 'findAllWithSummary').mockResolvedValue(mockResult);
      const result = await PayableCustomersService.GetAll(validCompanyId, 0, 10);
      expect(result).toEqual(mockResult);
    });
  });

  describe('GetStatement', () => {
    it('should throw NotFoundError if statement not found', async () => {
      vi.spyOn(CustomerRepository.prototype, 'getStatement').mockResolvedValue(null);
      await expect(PayableCustomersService.GetStatement('1', validCompanyId))
        .rejects.toThrow(NotFoundError);
    });

    it('should return statement if found', async () => {
      const mockStatement = { customer: {}, debts: [], payments: [] };
      vi.spyOn(CustomerRepository.prototype, 'getStatement').mockResolvedValue(mockStatement as any);
      const result = await PayableCustomersService.GetStatement('1', validCompanyId);
      expect(result).toEqual(mockStatement);
    });
  });

  describe('Update', () => {
    it('should update customer', async () => {
        vi.spyOn(CustomerRepository.prototype, 'update').mockResolvedValue([1]);
        await PayableCustomersService.Update('1', { name: 'New', is_company: true } as any, validCompanyId);
        expect(CustomerRepository.prototype.update).toHaveBeenCalled();
    });

    it('should throw NotFoundError if affectedRows is 0 and customer not found', async () => {
        vi.spyOn(CustomerRepository.prototype, 'update').mockResolvedValue([0]);
        vi.spyOn(CustomerRepository.prototype, 'findById').mockResolvedValue(null);
        await expect(PayableCustomersService.Update('1', { name: 'New', is_company: true } as any, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });
  });

  describe('Delete', () => {
    it('should delete customer', async () => {
        vi.spyOn(CustomerRepository.prototype, 'delete').mockResolvedValue(1);
        await PayableCustomersService.Delete('1', validUserId, validCompanyId);
        expect(CustomerRepository.prototype.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError if nothing deleted', async () => {
        vi.spyOn(CustomerRepository.prototype, 'delete').mockResolvedValue(0);
        await expect(PayableCustomersService.Delete('1', validUserId, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });
  });

  describe('Restore', () => {
    it('should restore customer', async () => {
        vi.spyOn(CustomerRepository.prototype, 'restore').mockResolvedValue(1);
        await PayableCustomersService.Restore('1', validUserId, validCompanyId);
        expect(CustomerRepository.prototype.restore).toHaveBeenCalled();
    });

    it('should throw NotFoundError if nothing restored', async () => {
        vi.spyOn(CustomerRepository.prototype, 'restore').mockResolvedValue(0);
        await expect(PayableCustomersService.Restore('1', validUserId, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });
  });

  describe('GetIdAndName', () => {
      it('should return results', async () => {
          vi.spyOn(CustomerRepository.prototype, 'findAllIdAndName').mockResolvedValue([]);
          const result = await PayableCustomersService.GetIdAndName(validCompanyId);
          expect(result).toEqual([]);
      });
  });
});
