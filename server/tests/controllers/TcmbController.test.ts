import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../index';
import { TcmbService } from '../../services/TcmbService';
import jwt from 'jsonwebtoken';

describe('TcmbController', () => {
  it('GET /tcmb should return exchange rates', async () => {
    const mockRates = {
      date: '19-04-2026',
      unixtime: '1234567890',
      usd: { forexBuying: '32.12', forexSelling: '32.56' },
      eur: { forexBuying: '34.12', forexSelling: '34.56' }
    };

    vi.spyOn(TcmbService, 'GetExchangeRates').mockResolvedValue(mockRates);

    const token = jwt.sign({ id: '1', role: 1, companyId: '1' }, process.env.JWT_SECRET as string);

    const response = await request(app)
      .get('/tcmb')
      .set('Cookie', [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRates);
  });

  it('GET /tcmb should return 500 if data is missing', async () => {
    vi.spyOn(TcmbService, 'GetExchangeRates').mockResolvedValue(null);

    const token = jwt.sign({ id: '1', role: 1, companyId: '1' }, process.env.JWT_SECRET as string);

    const response = await request(app)
      .get('/tcmb')
      .set('Cookie', [`access_token=${token}`]);

    expect(response.status).toBe(500);
  });

  it('GET /tcmb should return 401 if unauthorized', async () => {
    const response = await request(app).get('/tcmb');
    expect(response.status).toBe(401);
  });
});

