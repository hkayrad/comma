import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import PayableCustomersService from '@/services/Payable/CustomersService';
import jwt from 'jsonwebtoken';

describe('PayableCustomersController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d470';
  const token = jwt.sign({ id: '1', role: 1, companyId: validCompanyId }, process.env.JWT_SECRET as string);

  describe('POST /payables/customers', () => {
    it('should create customer', async () => {
      vi.spyOn(PayableCustomersService, 'Create').mockResolvedValue('new-id');
      const response = await request(app)
        .post('/payables/customers')
        .set('Cookie', [`access_token=${token}`])
        .send({ name: 'Test', is_company: true });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('new-id');
    });
  });

  describe('GET /payables/customers', () => {
    it('should get customers', async () => {
        const mockData = { rows: [], count: 0 };
        vi.spyOn(PayableCustomersService, 'GetAll').mockResolvedValue(mockData);
        const response = await request(app)
            .get('/payables/customers?page=0&limit=10')
            .set('Cookie', [`access_token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockData);
    });
  });

  describe('GET /payables/customers/:id/statement', () => {
      it('should get statement', async () => {
          const mockData = { customer: {}, debts: [], payments: [] };
          vi.spyOn(PayableCustomersService, 'GetStatement').mockResolvedValue(mockData as any);
          const response = await request(app)
              .get('/payables/customers/1/statement')
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(mockData);
      });
  });

  describe('PUT /payables/customers/:id', () => {
      it('should update customer', async () => {
          vi.spyOn(PayableCustomersService, 'Update').mockResolvedValue(undefined);
          const response = await request(app)
              .put('/payables/customers/1')
              .set('Cookie', [`access_token=${token}`])
              .send({ name: 'Updated', is_company: true });
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('DELETE /payables/customers/:id', () => {
      it('should delete customer', async () => {
          vi.spyOn(PayableCustomersService, 'Delete').mockResolvedValue(undefined);
          const response = await request(app)
              .delete('/payables/customers/1')
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });
});
