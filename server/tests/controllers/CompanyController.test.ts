import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../index';
import { CompanyService } from '../../services/CompanyService';
import jwt from 'jsonwebtoken';

describe('CompanyController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d470';
  const token = jwt.sign({ id: '1', role: 1, companyId: validCompanyId }, process.env.JWT_SECRET as string);

  it('GET /companies/id should return company data', async () => {
    const mockCompany = { id: validCompanyId, name: 'Test Co' };
    vi.spyOn(CompanyService, 'GetCompanyById').mockResolvedValue(mockCompany as any);

    const response = await request(app)
      .get('/companies/id')
      .set('Cookie', [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(mockCompany);
  });

  it('PUT /companies should update company data', async () => {
    vi.spyOn(CompanyService, 'UpdateCompanyDetails').mockResolvedValue(undefined);

    const response = await request(app)
      .put('/companies')
      .set('Cookie', [`access_token=${token}`])
      .send({ name: 'Updated Co', is_company: true });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('PUT /companies should return 400 for empty body', async () => {
      const response = await request(app)
        .put('/companies')
        .set('Cookie', [`access_token=${token}`])
        .send({});
      expect(response.status).toBe(400);
  });

  it('POST /companies/logo/small should return 400 if no file', async () => {
    const response = await request(app)
      .post('/companies/logo/small')
      .set('Cookie', [`access_token=${token}`]);
    expect(response.status).toBe(400);
  });

  it('POST /companies/logo/large should upload logo', async () => {
    vi.spyOn(CompanyService, 'UploadLogo').mockResolvedValue({ filename: 'large.webp' } as any);
    
    const response = await request(app)
      .post('/companies/logo/large')
      .set('Cookie', [`access_token=${token}`])
      .attach('logo', Buffer.from('test'), 'test.png');
    
    expect(response.status).toBe(200);
    expect(response.body.data.filename).toBe('large.webp');
  });

  it('POST /companies/logo/large should return 400 if no file', async () => {
    const response = await request(app)
      .post('/companies/logo/large')
      .set('Cookie', [`access_token=${token}`]);
    expect(response.status).toBe(400);
  });

  it('GET /companies/logos should return logo data', async () => {
    const mockLogos = { small: 'small.png', large: 'large.png' };
    vi.spyOn(CompanyService, 'GetLogos').mockResolvedValue(mockLogos as any);

    const response = await request(app)
      .get('/companies/logos')
      .set('Cookie', [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(mockLogos);
  });

  it('DELETE /companies/logo/small should delete logo', async () => {
      vi.spyOn(CompanyService, 'DeleteLogo').mockResolvedValue(undefined);
      const response = await request(app)
        .delete('/companies/logo/small')
        .set('Cookie', [`access_token=${token}`]);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
  });

  it('DELETE /companies/logo/large should delete large logo', async () => {
    vi.spyOn(CompanyService, 'DeleteLogo').mockResolvedValue(undefined);
    const response = await request(app)
      .delete('/companies/logo/large')
      .set('Cookie', [`access_token=${token}`]);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
});
});
