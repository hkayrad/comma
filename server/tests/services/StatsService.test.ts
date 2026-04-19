import { describe, it, expect } from 'vitest';
import StatsService from '../../services/StatsService';

describe('StatsService', () => {
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
});
