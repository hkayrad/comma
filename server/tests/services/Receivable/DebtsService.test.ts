import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReceivableDebtsService from '../../../services/Receivable/DebtsService';
import { DebtRepository } from '../../../repositories/DebtRepository';
import { NotFoundError, ValidationError } from '../../../lib/errors/AppError';

describe('ReceivableDebtsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = '00000000-0000-0000-0000-000000000000';
  const validUserId = '00000000-0000-0000-0000-000000000001';

  describe('Create', () => {
    it('should throw ValidationError if required fields missing', async () => {
      await expect(ReceivableDebtsService.Create({} as any, validUserId, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should create debt and return id', async () => {
      vi.spyOn(DebtRepository.prototype, 'create').mockResolvedValue({ id: 'new-id' } as any);
      const result = await ReceivableDebtsService.Create({
        customer_id: '1', amount: 100, vat: 20, currency: 'TRY', exchange_rate: 1, issue_date: new Date()
      } as any, validUserId, validCompanyId);
      expect(result).toBe('new-id');
    });
  });

  describe('GetAll', () => {
    it('should return paginated debts', async () => {
      const mockResult = { rows: [], count: 0 };
      vi.spyOn(DebtRepository.prototype, 'findAllWithSummary').mockResolvedValue(mockResult);
      const result = await ReceivableDebtsService.GetAll(validCompanyId, 0, 10);
      expect(result).toEqual(mockResult);
    });
  });

  describe('GetTotals', () => {
    it('should throw NotFoundError if no totals found', async () => {
      vi.spyOn(DebtRepository.prototype, 'getTotals').mockResolvedValue(null);
      await expect(ReceivableDebtsService.GetTotals(validCompanyId, 'TRY'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return totals if found', async () => {
      const mockTotals = { total_debts: 100, total_payments: 50, remaining_debt: 50 };
      vi.spyOn(DebtRepository.prototype, 'getTotals').mockResolvedValue(mockTotals as any);
      const result = await ReceivableDebtsService.GetTotals(validCompanyId, 'TRY');
      expect(result).toEqual(mockTotals);
    });
  });

  describe('Update', () => {
    it('should update debt', async () => {
        vi.spyOn(DebtRepository.prototype, 'update').mockResolvedValue([1]);
        await ReceivableDebtsService.Update('1', {
            customer_id: '1', amount: 100, vat: 20, currency: 'TRY', exchange_rate: 1, issue_date: new Date()
        } as any, validCompanyId);
        expect(DebtRepository.prototype.update).toHaveBeenCalled();
    });

    it('should throw NotFoundError if affectedRows is 0 and debt not found', async () => {
        vi.spyOn(DebtRepository.prototype, 'update').mockResolvedValue([0]);
        vi.spyOn(DebtRepository.prototype, 'findById').mockResolvedValue(null);
        await expect(ReceivableDebtsService.Update('1', {
            customer_id: '1', amount: 100, vat: 20, currency: 'TRY', exchange_rate: 1, issue_date: new Date()
        } as any, validCompanyId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Delete', () => {
    it('should delete debt', async () => {
        vi.spyOn(DebtRepository.prototype, 'delete').mockResolvedValue(1);
        await ReceivableDebtsService.Delete('1', validUserId, validCompanyId);
        expect(DebtRepository.prototype.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError if nothing deleted', async () => {
        vi.spyOn(DebtRepository.prototype, 'delete').mockResolvedValue(0);
        await expect(ReceivableDebtsService.Delete('1', validUserId, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });
  });

  describe('GetUpcomingDueDates', () => {
      it('should return upcoming due dates', async () => {
          vi.spyOn(DebtRepository.prototype, 'getUpcomingDueDates').mockResolvedValue([]);
          const result = await ReceivableDebtsService.GetUpcomingDueDates(validCompanyId);
          expect(result).toEqual([]);
      });
  });
});
