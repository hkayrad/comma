import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReceivableCustomersService from '@/services/Receivable/CustomersService';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import { NotFoundError, ValidationError } from '@/lib/errors/AppError';
import { ADMIN_COMPANY_ID } from '@comma/common/constants';

describe('ReceivableCustomersService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = ADMIN_COMPANY_ID;
  const validUserId = '00000000-0000-0000-0000-000000000001';

  describe('Create', () => {
    it('should throw ValidationError if name missing', async () => {
      await expect(ReceivableCustomersService.Create({ is_company: true } as any, validUserId, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if is_company missing', async () => {
      await expect(ReceivableCustomersService.Create({ name: 'Test' } as any, validUserId, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should create customer and return id', async () => {
      vi.spyOn(CustomerRepository.prototype, 'create').mockResolvedValue({ id: 'new-id' } as any);
      const result = await ReceivableCustomersService.Create({ name: 'Test', is_company: true } as any, validUserId, validCompanyId);
      expect(result).toBe('new-id');
    });
  });

  describe('CreateBatch', () => {
    it('should create customers in batch', async () => {
      const mockResult = [{ id: 'id1' }, { id: 'id2' }];
      vi.spyOn(CustomerRepository.prototype, 'createBatch').mockResolvedValue(mockResult as any);
      
      const customers = [
        { name: 'Customer 1', is_company: true },
        { name: 'Customer 2', is_company: false }
      ];
      
      const result = await ReceivableCustomersService.CreateBatch(customers as any, validUserId, validCompanyId);
      
      expect(CustomerRepository.prototype.createBatch).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('GetAll', () => {
    it('should return paginated results', async () => {
      const mockResult = { rows: [], count: 0 };
      vi.spyOn(CustomerRepository.prototype, 'findAllWithSummary').mockResolvedValue(mockResult);
      const result = await ReceivableCustomersService.GetAll(validCompanyId, 0, 10);
      expect(result).toEqual(mockResult);
    });
  });

  describe('GetStatement', () => {
    it('should throw ValidationError if customerId is missing', async () => {
      await expect(ReceivableCustomersService.GetStatement('', validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if statement not found', async () => {
      vi.spyOn(CustomerRepository.prototype, 'getStatement').mockResolvedValue(null);
      await expect(ReceivableCustomersService.GetStatement('1', validCompanyId))
        .rejects.toThrow(NotFoundError);
    });

    it('should return statement if found', async () => {
      const mockStatement = { customer: {}, debts: [], payments: [] };
      vi.spyOn(CustomerRepository.prototype, 'getStatement').mockResolvedValue(mockStatement as any);
      const result = await ReceivableCustomersService.GetStatement('1', validCompanyId);
      expect(result).toEqual(mockStatement);
    });
  });

  describe('GetIdAndName', () => {
    it('should return results', async () => {
        vi.spyOn(CustomerRepository.prototype, 'findAllIdAndName').mockResolvedValue([]);
        const result = await ReceivableCustomersService.GetIdAndName(validCompanyId);
        expect(result).toEqual([]);
    });
  });

  describe('Update', () => {
    it('should throw ValidationError if id is missing', async () => {
      await expect(ReceivableCustomersService.Update('', { name: 'New', is_company: true } as any, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if name or is_company is missing', async () => {
      await expect(ReceivableCustomersService.Update('1', { name: '' } as any, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should update customer', async () => {
        vi.spyOn(CustomerRepository.prototype, 'update').mockResolvedValue([1]);
        await ReceivableCustomersService.Update('1', { name: 'New', is_company: true } as any, validCompanyId);
        expect(CustomerRepository.prototype.update).toHaveBeenCalled();
    });

    it('should throw NotFoundError if affectedRows is 0 and customer not found', async () => {
        vi.spyOn(CustomerRepository.prototype, 'update').mockResolvedValue([0]);
        vi.spyOn(CustomerRepository.prototype, 'findById').mockResolvedValue(null);
        await expect(ReceivableCustomersService.Update('1', { name: 'New', is_company: true } as any, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });

    it('should not throw error if affectedRows is 0 and customer found', async () => {
        vi.spyOn(CustomerRepository.prototype, 'update').mockResolvedValue([0]);
        vi.spyOn(CustomerRepository.prototype, 'findById').mockResolvedValue({ id: '1' } as any);
        await ReceivableCustomersService.Update('1', { name: 'New', is_company: true } as any, validCompanyId);
        expect(CustomerRepository.prototype.findById).toHaveBeenCalled();
    });
  });

  describe('Delete', () => {
    it('should throw ValidationError if id is missing', async () => {
      await expect(ReceivableCustomersService.Delete('', validUserId, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should delete customer', async () => {
        vi.spyOn(CustomerRepository.prototype, 'delete').mockResolvedValue(1);
        await ReceivableCustomersService.Delete('1', validUserId, validCompanyId);
        expect(CustomerRepository.prototype.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError if nothing deleted', async () => {
        vi.spyOn(CustomerRepository.prototype, 'delete').mockResolvedValue(0);
        await expect(ReceivableCustomersService.Delete('1', validUserId, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });
  });

  describe('Restore', () => {
    it('should throw ValidationError if id is missing', async () => {
      await expect(ReceivableCustomersService.Restore('', validUserId, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should restore customer', async () => {
        vi.spyOn(CustomerRepository.prototype, 'restore').mockResolvedValue(1);
        await ReceivableCustomersService.Restore('1', validUserId, validCompanyId);
        expect(CustomerRepository.prototype.restore).toHaveBeenCalled();
    });

    it('should throw NotFoundError if nothing restored', async () => {
        vi.spyOn(CustomerRepository.prototype, 'restore').mockResolvedValue(0);
        await expect(ReceivableCustomersService.Restore('1', validUserId, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });
  });
});
