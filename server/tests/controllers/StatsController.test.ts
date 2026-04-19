import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../index';
import StatsService from '../../services/StatsService';
import jwt from 'jsonwebtoken';

describe('StatsController', () => {
  it('GET /stats/monthly should return stats', async () => {
    const mockData = [{ month: '2026-04', receivable: 100, payable: 50 }];
    vi.spyOn(StatsService, 'GetMonthlyStats').mockResolvedValue(mockData);

    const token = jwt.sign({ id: '1', role: 1, companyId: 'test-company' }, process.env.JWT_SECRET as string);

    const response = await request(app)
      .get('/stats/monthly')
      .set('Cookie', [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(mockData);
  });

  it('GET /stats/monthly should return 401 if unauthorized', async () => {
    const response = await request(app).get('/stats/monthly');
    expect(response.status).toBe(401);
  });
});
