import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReceivableCustomersService from '../../../services/Receivable/CustomersService';
import { CustomerRepository } from '../../../repositories/CustomerRepository';
import { NotFoundError, ValidationError } from '../../../lib/errors/AppError';
import { ADMIN_COMPANY_ID } from '@common/constants';

describe('ReceivableCustomersService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = ADMIN_COMPANY_ID;
  const validUserId = '00000000-0000-0000-0000-000000000001';

  describe('Create', () => {
    it('should throw ValidationError if name missing', async () => {
      await expect(ReceivableCustomersService.Create({} as any, validUserId, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should create customer and return id', async () => {
      vi.spyOn(CustomerRepository.prototype, 'create').mockResolvedValue({ id: 'new-id' } as any);
      const result = await ReceivableCustomersService.Create({ name: 'Test', is_company: true } as any, validUserId, validCompanyId);
      expect(result).toBe('new-id');
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

  describe('Update', () => {
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
  });

  describe('Delete', () => {
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
});
