import { describe, it, expect, afterAll, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import { Config } from '@/models';
import { ConfigService } from '@/services/ConfigService';
import jwt from 'jsonwebtoken';
import { UserRole } from '@common/enums';

describe('Config Controller Integration', () => {
  const TEST_KEY = 'INTEGRATION_TEST_KEY';
  const TEST_VALUE = 'integration_value';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await Config.destroy({ where: { configKey: TEST_KEY }, force: true });
  });

  const adminToken = jwt.sign({ id: '1', role: UserRole.ADMIN, companyId: '1' }, process.env.JWT_SECRET as string);
  const userToken = jwt.sign({ id: '2', role: 1, companyId: '1' }, process.env.JWT_SECRET as string);

  it('GET /configs should return 200', async () => {
    vi.spyOn(ConfigService, 'GetConfigs').mockResolvedValue({ [TEST_KEY]: TEST_VALUE });
    const response = await request(app).get('/configs');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('GET /configs should return 404 if no configs', async () => {
      vi.spyOn(ConfigService, 'GetConfigs').mockResolvedValue({});
      const response = await request(app).get('/configs');
      expect(response.status).toBe(404);
  });

  it('GET /configs/:key should return 404 for non-existent key', async () => {
    vi.spyOn(ConfigService, 'GetConfig').mockResolvedValue(null);
    const response = await request(app)
      .get('/configs/NON_EXISTENT_KEY')
      .set('Cookie', [`access_token=${adminToken}`]);
    expect(response.status).toBe(404);
  });

  it('POST /configs should return 401 without token', async () => {
    const response = await request(app)
      .post('/configs')
      .send({ configKey: TEST_KEY, configValue: TEST_VALUE });
    expect(response.status).toBe(401);
  });

  it('POST /configs should return 403 for non-admin user', async () => {
    const response = await request(app)
      .post('/configs')
      .set('Cookie', [`access_token=${userToken}`])
      .send({ configKey: TEST_KEY, configValue: TEST_VALUE });
    expect(response.status).toBe(403);
  });

  it('POST /configs should work for admin user', async () => {
    vi.spyOn(ConfigService, 'SetConfig').mockResolvedValue(undefined);
    vi.spyOn(ConfigService, 'GetConfig').mockResolvedValue(TEST_VALUE);

    const response = await request(app)
      .post('/configs')
      .set('Cookie', [`access_token=${adminToken}`])
      .send({ configKey: TEST_KEY, configValue: TEST_VALUE });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('POST /configs/start-maintenance should return 403 for non-admin', async () => {
      const response = await request(app)
        .post('/configs/start-maintenance')
        .set('Cookie', [`access_token=${userToken}`]);
      expect(response.status).toBe(403);
  });

  it('POST /configs/start-maintenance should work for admin', async () => {
      vi.spyOn(ConfigService, 'StartMaintenanceMode').mockResolvedValue(undefined);
      const response = await request(app)
        .post('/configs/start-maintenance')
        .set('Cookie', [`access_token=${adminToken}`]);
      expect(response.status).toBe(200);
  });

  it('POST /configs/end-maintenance should return 403 for non-admin', async () => {
      const response = await request(app)
        .post('/configs/end-maintenance')
        .set('Cookie', [`access_token=${userToken}`]);
      expect(response.status).toBe(403);
  });

  it('POST /configs/end-maintenance should work for admin', async () => {
      vi.spyOn(ConfigService, 'EndMaintenanceMode').mockResolvedValue(undefined);
      const response = await request(app)
        .post('/configs/end-maintenance')
        .set('Cookie', [`access_token=${adminToken}`]);
      expect(response.status).toBe(200);
  });
});

