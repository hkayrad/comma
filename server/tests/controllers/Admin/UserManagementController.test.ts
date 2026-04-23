import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import { UserManagementService } from '@/services/Admin/UserManagementService';
import jwt from 'jsonwebtoken';
import { UserRole, ADMIN_COMPANY_ID } from '@comma/common';

describe('UserManagementController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = ADMIN_COMPANY_ID;
  const adminToken = jwt.sign({ id: 'admin-id', role: UserRole.ADMIN, companyId: validCompanyId }, process.env.JWT_SECRET as string);

  describe('POST /admin/users', () => {
    it('should create a user', async () => {
      vi.spyOn(UserManagementService, 'Create').mockResolvedValue('new-user-id');
      const response = await request(app)
        .post('/admin/users')
        .set('Cookie', [`access_token=${adminToken}`])
        .send({ company_id: validCompanyId, username: 'newuser', password: 'password', role: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('new-user-id');
    });
  });

  describe('GET /admin/users/company/:companyId', () => {
    it('should get users by company', async () => {
        const mockData = { rows: [], count: 0 };
        vi.spyOn(UserManagementService, 'GetAllByCompany').mockResolvedValue(mockData as any);
        const response = await request(app)
            .get(`/admin/users/company/${validCompanyId}?page=0&limit=10`)
            .set('Cookie', [`access_token=${adminToken}`]);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockData);
    });
  });

  describe('GET /admin/users/:id', () => {
      it('should get user by id', async () => {
          const mockUser = { id: '1', username: 'test' };
          vi.spyOn(UserManagementService, 'GetById').mockResolvedValue(mockUser as any);
          const response = await request(app)
              .get('/admin/users/1')
              .set('Cookie', [`access_token=${adminToken}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(mockUser);
      });
  });

  describe('PUT /admin/users/:id', () => {
      it('should update user', async () => {
          const mockUser = { id: '1', username: 'updated' };
          vi.spyOn(UserManagementService, 'Update').mockResolvedValue(mockUser as any);
          const response = await request(app)
              .put('/admin/users/1')
              .set('Cookie', [`access_token=${adminToken}`])
              .send({ username: 'updated' });
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(mockUser);
      });
  });

  describe('DELETE /admin/users/:id', () => {
      it('should delete user', async () => {
          vi.spyOn(UserManagementService, 'Delete').mockResolvedValue(undefined);
          const response = await request(app)
              .delete('/admin/users/1')
              .set('Cookie', [`access_token=${adminToken}`]);
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('POST /admin/users/:id/restore', () => {
      it('should restore user', async () => {
          vi.spyOn(UserManagementService, 'Restore').mockResolvedValue(undefined);
          const response = await request(app)
              .post('/admin/users/1/restore')
              .set('Cookie', [`access_token=${adminToken}`]);
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('POST /admin/users/:id/reset-password', () => {
      it('should reset password', async () => {
          vi.spyOn(UserManagementService, 'ResetPassword').mockResolvedValue(undefined);
          const response = await request(app)
              .post('/admin/users/1/reset-password')
              .set('Cookie', [`access_token=${adminToken}`])
              .send({ password: 'newpassword' });
          
          expect(response.status).toBe(200);
          expect(UserManagementService.ResetPassword).toHaveBeenCalledWith('1', 'newpassword');
      });

      it('should return 400 if password missing', async () => {
        const response = await request(app)
            .post('/admin/users/1/reset-password')
            .set('Cookie', [`access_token=${adminToken}`])
            .send({});
        
        expect(response.status).toBe(400);
      });
  });
});
