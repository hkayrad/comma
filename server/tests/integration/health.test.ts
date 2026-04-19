import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../index';

describe('Health Endpoint', () => {
  it('GET /health should return 200 and status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
