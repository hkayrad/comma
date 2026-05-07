import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayableDebtsService from '@/services/Payable/DebtsService';
import { DebtRepository } from '@/repositories/DebtRepository';
import { NotFoundError, ValidationError } from '@/lib/errors/AppError';
import { sequelize } from '@/lib/db/sequelize';

describe('PayableDebtsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d470';
  const validUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d471';
  const validDebtDto = {
    customer_id: '1', amount: 100, vat: 20, currency: 'TRY', exchange_rate: 1, issue_date: new Date()
  };

  describe('Create', () => {
    it('should throw ValidationError if required fields missing', async () => {
      await expect(PayableDebtsService.Create({} as any, validUserId, validCompanyId))
        .rejects.toThrow(ValidationError);
        
      const requiredFields = ['customer_id', 'amount', 'issue_date', 'vat', 'currency', 'exchange_rate'];
      for (const field of requiredFields) {
        const invalidDto = { ...validDebtDto, [field]: undefined };
        await expect(PayableDebtsService.Create(invalidDto as any, validUserId, validCompanyId))
          .rejects.toThrow(ValidationError);
      }
    });

    it('should create debt and return id', async () => {
      vi.spyOn(DebtRepository.prototype, 'create').mockResolvedValue({ id: 'new-id' } as any);
      const result = await PayableDebtsService.Create(validDebtDto as any, validUserId, validCompanyId);
      expect(result).toBe('new-id');
    });
  });

  describe('CreateBatch', () => {
    it('should create a batch of debts', async () => {
      vi.spyOn(sequelize, 'transaction').mockImplementation(async (cb) => await cb({} as any));
      vi.spyOn(DebtRepository.prototype, 'createBatch').mockResolvedValue([{ id: 'new-id-1' }, { id: 'new-id-2' }] as any);
      
      const debts = [validDebtDto, { ...validDebtDto, amount: 200 }];
      const result = await PayableDebtsService.CreateBatch(debts as any, validUserId, validCompanyId);
      
      expect(result).toHaveLength(2);
      expect(DebtRepository.prototype.createBatch).toHaveBeenCalled();
    });
  });

  describe('GetAll', () => {
    it('should return paginated debts', async () => {
      const mockResult = { rows: [], count: 0 };
      vi.spyOn(DebtRepository.prototype, 'findAllWithSummary').mockResolvedValue(mockResult);
      const result = await PayableDebtsService.GetAll(validCompanyId, 0, 10);
      expect(result).toEqual(mockResult);
    });
  });

  describe('GetTotals', () => {
    it('should throw NotFoundError if no totals found', async () => {
      vi.spyOn(DebtRepository.prototype, 'getTotals').mockResolvedValue(null);
      await expect(PayableDebtsService.GetTotals(validCompanyId, 'TRY'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return totals if found', async () => {
      const mockTotals = { total_debts: 100, total_payments: 50, remaining_debt: 50 };
      vi.spyOn(DebtRepository.prototype, 'getTotals').mockResolvedValue(mockTotals as any);
      const result = await PayableDebtsService.GetTotals(validCompanyId, 'TRY');
      expect(result).toEqual(mockTotals);
    });
  });

  describe("Update", () => {
    it('should throw ValidationError if id is missing', async () => {
      await expect(PayableDebtsService.Update('' as any, validDebtDto as any, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if required fields missing', async () => {
      const requiredFields = ['customer_id', 'amount', 'issue_date', 'vat', 'currency', 'exchange_rate'];
      for (const field of requiredFields) {
        const invalidDto = { ...validDebtDto, [field]: undefined };
        await expect(PayableDebtsService.Update('1', invalidDto as any, validCompanyId))
          .rejects.toThrow(ValidationError);
      }
    });

    it("should update debt", async () => {
      vi.spyOn(DebtRepository.prototype, "update").mockResolvedValue([1, []]);
      await PayableDebtsService.Update("1", validDebtDto as any, validCompanyId);
      expect(DebtRepository.prototype.update).toHaveBeenCalled();
    });
    
    it("should not throw error if affectedRows is 0 but debt exists", async () => {
      vi.spyOn(DebtRepository.prototype, "update").mockResolvedValue([0, []]);
      vi.spyOn(DebtRepository.prototype, "findById").mockResolvedValue({ id: '1' } as any);
      await expect(PayableDebtsService.Update("1", validDebtDto as any, validCompanyId)).resolves.not.toThrow();
    });

    it("should throw NotFoundError if affectedRows is 0 and debt not found", async () => {
      vi.spyOn(DebtRepository.prototype, "update").mockResolvedValue([0, []]);
      vi.spyOn(DebtRepository.prototype, "findById").mockResolvedValue(null as any);
      await expect(PayableDebtsService.Update("1", validDebtDto as any, validCompanyId))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('Delete', () => {
    it('should throw ValidationError if id is missing', async () => {
        await expect(PayableDebtsService.Delete('' as any, validUserId, validCompanyId))
            .rejects.toThrow(ValidationError);
    });

    it('should delete debt', async () => {
        vi.spyOn(DebtRepository.prototype, 'delete').mockResolvedValue(1);
        await PayableDebtsService.Delete('1', validUserId, validCompanyId);
        expect(DebtRepository.prototype.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError if nothing deleted', async () => {
        vi.spyOn(DebtRepository.prototype, 'delete').mockResolvedValue(0);
        await expect(PayableDebtsService.Delete('1', validUserId, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });
  });

  describe('Restore', () => {
    it('should throw ValidationError if id is missing', async () => {
        await expect(PayableDebtsService.Restore('' as any, validUserId, validCompanyId))
            .rejects.toThrow(ValidationError);
    });

    it('should restore debt', async () => {
        vi.spyOn(DebtRepository.prototype, 'restore').mockResolvedValue([1]);
        await PayableDebtsService.Restore('1', validUserId, validCompanyId);
        expect(DebtRepository.prototype.restore).toHaveBeenCalledWith('1', validCompanyId);
    });

    it('should throw NotFoundError if nothing restored', async () => {
        vi.spyOn(DebtRepository.prototype, 'restore').mockResolvedValue([0]);
        await expect(PayableDebtsService.Restore('1', validUserId, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });
  });

  describe('GetUpcomingDueDates', () => {
      it('should return upcoming due dates', async () => {
          vi.spyOn(DebtRepository.prototype, 'getUpcomingDueDates').mockResolvedValue([]);
          const result = await PayableDebtsService.GetUpcomingDueDates(validCompanyId);
          expect(result).toEqual([]);
      });
  });
});