import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../index';
import { CompanyService } from '../../services/CompanyService';
import jwt from 'jsonwebtoken';

describe('CompanyController', () => {
  it('GET /companies/id should return company data', async () => {
    const mockCompany = { id: 'test-company', name: 'Test Co' };
    vi.spyOn(CompanyService, 'GetCompanyById').mockResolvedValue(mockCompany as any);

    const token = jwt.sign({ id: '1', role: 1, companyId: 'test-company' }, process.env.JWT_SECRET as string);

    const response = await request(app)
      .get('/companies/id')
      .set('Cookie', [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(mockCompany);
  });

  it('PUT /companies should update company data', async () => {
    vi.spyOn(CompanyService, 'UpdateCompanyDetails').mockResolvedValue();

    const token = jwt.sign({ id: '1', role: 1, companyId: 'test-company' }, process.env.JWT_SECRET as string);

    const response = await request(app)
      .put('/companies')
      .set('Cookie', [`access_token=${token}`])
      .send({ name: 'Updated Co' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(CompanyService.UpdateCompanyDetails).toHaveBeenCalledWith('test-company', { name: 'Updated Co' });
  });

  it('GET /companies/logos should return logo data', async () => {
    const mockLogos = { small: 'small.png', large: 'large.png' };
    vi.spyOn(CompanyService, 'GetLogos').mockResolvedValue(mockLogos as any);

    const token = jwt.sign({ id: '1', role: 1, companyId: 'test-company' }, process.env.JWT_SECRET as string);

    const response = await request(app)
      .get('/companies/logos')
      .set('Cookie', [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(mockLogos);
  });
});
