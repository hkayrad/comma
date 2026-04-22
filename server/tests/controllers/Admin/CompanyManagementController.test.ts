import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import { CompanyManagementService } from '@/services/Admin/CompanyManagementService';
import jwt from 'jsonwebtoken';
import { UserRole } from '@comma/common/enums';
import { ADMIN_COMPANY_ID, ADMIN_USER_ID } from '@comma/common/constants';

describe('CompanyManagementController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const adminToken = jwt.sign({ id: ADMIN_USER_ID, role: UserRole.ADMIN, companyId: ADMIN_COMPANY_ID }, process.env.JWT_SECRET as string);

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
        .get('/admin/companies?page=0&limit=10')
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockResult);
    });
  });

  describe('GET /admin/companies/:id', () => {
      it('should return company data', async () => {
          const mockCo = { id: '1', name: 'Test' };
          vi.spyOn(CompanyManagementService, 'GetById').mockResolvedValue(mockCo as any);
          const response = await request(app)
              .get('/admin/companies/1')
              .set('Cookie', [`access_token=${adminToken}`]);
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(mockCo);
      });
  });

  describe('PUT /admin/companies/:id', () => {
      it('should update company', async () => {
          const mockCo = { id: '1', name: 'Updated' };
          vi.spyOn(CompanyManagementService, 'Update').mockResolvedValue(mockCo as any);
          const response = await request(app)
              .put('/admin/companies/1')
              .set('Cookie', [`access_token=${adminToken}`])
              .send({ name: 'Updated', is_company: true });
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(mockCo);
      });
  });

  describe('DELETE /admin/companies/:id', () => {
      it('should delete company', async () => {
          vi.spyOn(CompanyManagementService, 'Delete').mockResolvedValue(undefined);
          const response = await request(app)
              .delete('/admin/companies/1')
              .set('Cookie', [`access_token=${adminToken}`]);
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });
});
