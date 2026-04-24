import { describe, it, expect, vi, beforeEach } from 'vitest';
import StatsService from '@/services/StatsService';
import { DebtRepository } from '@/repositories/DebtRepository';

describe('StatsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 12 months of data by default', async () => {
    const data = await StatsService.GetMonthlyStats('dummy-company-id');
    expect(data).toHaveLength(12);
    expect(data[0]).toHaveProperty('month');
    expect(data[0]).toHaveProperty('receivable');
    expect(data[0]).toHaveProperty('payable');
  });

  it('should return correct month count when specified', async () => {
    const data = await StatsService.GetMonthlyStats('dummy-company-id', undefined, 6);
    expect(data).toHaveLength(6);
  });

  it('should use startDate if provided', async () => {
      const startDate = new Date('2026-01-01');
      const data = await StatsService.GetMonthlyStats('dummy-company-id', startDate, 3);
      expect(data).toHaveLength(3);
      expect(data[0].month).toBe('2026-01');
      expect(data[1].month).toBe('2026-02');
      expect(data[2].month).toBe('2026-03');
  });

  it('should correctly map repo results', async () => {
      vi.spyOn(DebtRepository.prototype, 'getMonthlyStats').mockImplementation(async (companyId, start, end) => {
          // If called for receivable
          if (start.getFullYear() === 2026) {
              return [{ month: '2026-02', total: '150.50' }];
          }
          return [];
      });

      const startDate = new Date('2026-01-01');
      const data = await StatsService.GetMonthlyStats('id', startDate, 3);
      
      const feb = data.find(d => d.month === '2026-02');
      expect(feb?.receivable).toBe(150.50);
      expect(feb?.payable).toBe(150.50); // Since we mocked prototype and both recRepo/payRepo use it
  });
});
