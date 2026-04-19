import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../index';
import { CompanyManagementService } from '../../../services/Admin/CompanyManagementService';
import jwt from 'jsonwebtoken';

describe('CompanyManagementController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const adminToken = jwt.sign({ id: '1', role: 99, companyId: '1' }, process.env.JWT_SECRET as string);

  describe('POST /admin/companies', () => {
    it('should create a company', async () => {
      vi.spyOn(CompanyManagementService, 'Create').mockResolvedValue('new-id');
      const response = await request(app)
        .post('/admin/companies')
        .set('Cookie', [`access_token=${adminToken}`])
        .send({ name: 'New Admin Co', is_company: true });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('new-id');
    });
  });

  describe('GET /admin/companies', () => {
    it('should get companies with pagination', async () => {
      const mockResult = { rows: [], count: 0 };
      vi.spyOn(CompanyManagementService, 'GetAll').mockResolvedValue(mockResult as any);
      
      const response = await request(app)
        .get('/admin/companies?page=1&limit=10')
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockResult);
    });
  });
});
