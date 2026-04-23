import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import ReceivableCustomersService from '@/services/Receivable/CustomersService';
import jwt from 'jsonwebtoken';
import { ADMIN_COMPANY_ID } from '@comma/common/constants';

describe('ReceivableCustomersController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = ADMIN_COMPANY_ID;
  const token = jwt.sign({ id: '1', role: 1, companyId: validCompanyId }, process.env.JWT_SECRET as string);

  describe('POST /receivables/customers', () => {
    it('should create customer', async () => {
      vi.spyOn(ReceivableCustomersService, 'Create').mockResolvedValue('new-id');
      const response = await request(app)
        .post('/receivables/customers')
        .set('Cookie', [`access_token=${token}`])
        .send({ name: 'Test', is_company: true });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('new-id');
    });
  });

  describe('GET /receivables/customers', () => {
    it('should get customers', async () => {
        const mockData = { rows: [], count: 0 };
        vi.spyOn(ReceivableCustomersService, 'GetAll').mockResolvedValue(mockData);
        const response = await request(app)
            .get('/receivables/customers?page=0&limit=10')
            .set('Cookie', [`access_token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockData);
    });
  });

  describe('GET /receivables/customers/:id/statement', () => {
      it('should get statement', async () => {
          const mockData = { customer: {}, debts: [], payments: [] };
          vi.spyOn(ReceivableCustomersService, 'GetStatement').mockResolvedValue(mockData as any);
          const response = await request(app)
              .get('/receivables/customers/1/statement')
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(mockData);
      });
  });

  describe('PUT /receivables/customers/:id', () => {
      it('should update customer', async () => {
          vi.spyOn(ReceivableCustomersService, 'Update').mockResolvedValue(undefined);
          const response = await request(app)
              .put('/receivables/customers/1')
              .set('Cookie', [`access_token=${token}`])
              .send({ name: 'Updated', is_company: true });
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('DELETE /receivables/customers/:id', () => {
      it('should delete customer', async () => {
          vi.spyOn(ReceivableCustomersService, 'Delete').mockResolvedValue(undefined);
          const response = await request(app)
              .delete('/receivables/customers/1')
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('POST /receivables/customers/:id/restore', () => {
      it('should restore customer', async () => {
          vi.spyOn(ReceivableCustomersService, 'Restore').mockResolvedValue(undefined);
          const response = await request(app)
              .post('/receivables/customers/1/restore')
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });
});
