import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReceivablePaymentsService from '@/services/Receivable/PaymentsService';
import { PaymentRepository } from '@/repositories/PaymentRepository';
import { NotFoundError, ValidationError } from '@/lib/errors/AppError';
import { ADMIN_COMPANY_ID } from '@comma/common/constants';

describe('ReceivablePaymentsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = ADMIN_COMPANY_ID;
  const validUserId = '00000000-0000-0000-0000-000000000001';

  describe('Create', () => {
    it('should throw ValidationError if required fields missing', async () => {
      await expect(ReceivablePaymentsService.Create({} as any, validUserId, validCompanyId))
        .rejects.toThrow(ValidationError);
    });

    it('should create payment and return it', async () => {
      vi.spyOn(PaymentRepository.prototype, 'create').mockResolvedValue({ id: 'new-id' } as any);
      const result = await ReceivablePaymentsService.Create({
        customer_id: '1', amount: 100, currency: 'TRY', exchange_rate: 1, 
        payment_date: new Date(), payment_method: 'cash'
      } as any, validUserId, validCompanyId);
      expect(result.id).toBe('new-id');
    });
  });

  describe('GetAll', () => {
    it('should return paginated payments', async () => {
      const mockResult = { rows: [], count: 0 };
      vi.spyOn(PaymentRepository.prototype, 'findAllWithPagination').mockResolvedValue(mockResult);
      const result = await ReceivablePaymentsService.GetAll(validCompanyId, 0, 10);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Update', () => {
    it('should update payment', async () => {
        vi.spyOn(PaymentRepository.prototype, 'update').mockResolvedValue([1]);
        await ReceivablePaymentsService.Update('1', {
            customer_id: '1', amount: 100, currency: 'TRY', exchange_rate: 1, 
            payment_date: new Date(), payment_method: 'cash'
        } as any, validCompanyId);
        expect(PaymentRepository.prototype.update).toHaveBeenCalled();
    });

    it('should throw NotFoundError if affectedRows is 0 and payment not found', async () => {
        vi.spyOn(PaymentRepository.prototype, 'update').mockResolvedValue([0]);
        vi.spyOn(PaymentRepository.prototype, 'findById').mockResolvedValue(null);
        await expect(ReceivablePaymentsService.Update('1', {
            customer_id: '1', amount: 100, currency: 'TRY', exchange_rate: 1, 
            payment_date: new Date(), payment_method: 'cash'
        } as any, validCompanyId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Delete', () => {
    it('should delete payment', async () => {
        vi.spyOn(PaymentRepository.prototype, 'delete').mockResolvedValue(1);
        await ReceivablePaymentsService.Delete('1', validUserId, validCompanyId);
        expect(PaymentRepository.prototype.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError if nothing deleted', async () => {
        vi.spyOn(PaymentRepository.prototype, 'delete').mockResolvedValue(0);
        await expect(ReceivablePaymentsService.Delete('1', validUserId, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });
  });

  describe('Restore', () => {
    it('should restore payment', async () => {
        vi.spyOn(PaymentRepository.prototype, 'restore').mockResolvedValue([1]);
        await ReceivablePaymentsService.Restore('1', validUserId, validCompanyId);
        expect(PaymentRepository.prototype.restore).toHaveBeenCalledWith('1', validCompanyId);
    });

    it('should throw NotFoundError if nothing restored', async () => {
        vi.spyOn(PaymentRepository.prototype, 'restore').mockResolvedValue([0]);
        await expect(ReceivablePaymentsService.Restore('1', validUserId, validCompanyId))
            .rejects.toThrow(NotFoundError);
    });
  });

  describe('GetUpcomingChecks', () => {
      it('should return upcoming checks', async () => {
          vi.spyOn(PaymentRepository.prototype, 'getUpcomingChecks').mockResolvedValue([]);
          const result = await ReceivablePaymentsService.GetUpcomingChecks(validCompanyId);
          expect(result).toEqual([]);
      });
  });
});
