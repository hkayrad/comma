import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../index';
import { Config } from '../../models';
import jwt from 'jsonwebtoken';

describe('Config Controller Integration', () => {
  const TEST_KEY = 'INTEGRATION_TEST_KEY';
  const TEST_VALUE = 'integration_value';

  afterAll(async () => {
    await Config.destroy({ where: { configKey: TEST_KEY } });
  });

  it('GET /configs should return 200', async () => {
    const response = await request(app).get('/configs');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('GET /configs/:key should return 404 for non-existent key', async () => {
    const token = jwt.sign({ id: '1', role: 1, companyId: '1' }, process.env.JWT_SECRET as string);
    const response = await request(app)
      .get('/configs/NON_EXISTENT_KEY')
      .set('Cookie', [`access_token=${token}`]);
    expect(response.status).toBe(404);
  });

  it('POST /configs should return 401 without token', async () => {
    const response = await request(app)
      .post('/configs')
      .send({ configKey: TEST_KEY, configValue: TEST_VALUE });
    expect(response.status).toBe(401);
  });

  it('POST /configs should return 403 for non-admin user', async () => {
    const token = jwt.sign({ id: '1', role: 1, companyId: '1' }, process.env.JWT_SECRET as string);
    const response = await request(app)
      .post('/configs')
      .set('Cookie', [`access_token=${token}`])
      .send({ configKey: TEST_KEY, configValue: TEST_VALUE });
    expect(response.status).toBe(403);
  });

  it('POST /configs should work for admin user', async () => {
    const token = jwt.sign({ id: '1', role: 99, companyId: '1' }, process.env.JWT_SECRET as string);
    const response = await request(app)
      .post('/configs')
      .set('Cookie', [`access_token=${token}`])
      .send({ configKey: TEST_KEY, configValue: TEST_VALUE });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify it was set
    const getRes = await request(app)
      .get(`/configs/${TEST_KEY}`)
      .set('Cookie', [`access_token=${token}`]);
    expect(getRes.status).toBe(200);
    expect(getRes.body.configValue).toBe(TEST_VALUE);
  });
});
