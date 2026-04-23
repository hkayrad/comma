import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import PayablePaymentsService from '@/services/Payable/PaymentsService';
import jwt from 'jsonwebtoken';

describe('PayablePaymentsController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d470';
  const validCustomerId = 'f47ac10b-58cc-4372-a567-0e02b2c3d471';
  const validPaymentId = 'f47ac10b-58cc-4372-a567-0e02b2c3d474';
  const token = jwt.sign({ id: '1', role: 1, companyId: validCompanyId }, process.env.JWT_SECRET as string);

  describe('POST /payables/payments', () => {
    it('should create payment', async () => {
      vi.spyOn(PayablePaymentsService, 'Create').mockResolvedValue({ id: 'new-id' } as any);
      const response = await request(app)
        .post('/payables/payments')
        .set('Cookie', [`access_token=${token}`])
        .send({ 
            customer_id: validCustomerId, amount: 100, currency: 'TRY', 
            exchange_rate: 1, payment_date: '2026-01-01', payment_method: 'cash'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('new-id');
    });
  });

  describe('GET /payables/payments', () => {
    it('should get all payments', async () => {
        const mockData = { rows: [], count: 0 };
        vi.spyOn(PayablePaymentsService, 'GetAll').mockResolvedValue(mockData);
        const response = await request(app)
            .get('/payables/payments?page=0&limit=10')
            .set('Cookie', [`access_token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockData);
    });
  });

  describe('PUT /payables/payments/:id', () => {
      it('should update payment', async () => {
          vi.spyOn(PayablePaymentsService, 'Update').mockResolvedValue(undefined);
          const response = await request(app)
              .put(`/payables/payments/${validPaymentId}`)
              .set('Cookie', [`access_token=${token}`])
              .send({ 
                customer_id: validCustomerId, amount: 100, currency: 'TRY', 
                exchange_rate: 1, payment_date: '2026-01-01', payment_method: 'cash'
              });
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('DELETE /payables/payments/:id', () => {
      it('should delete payment', async () => {
          vi.spyOn(PayablePaymentsService, 'Delete').mockResolvedValue(undefined);
          const response = await request(app)
              .delete(`/payables/payments/${validPaymentId}`)
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('POST /payables/payments/:id/restore', () => {
    it('should restore payment', async () => {
        vi.spyOn(PayablePaymentsService, 'Restore').mockResolvedValue(undefined);
        const response = await request(app)
            .post(`/payables/payments/${validPaymentId}/restore`)
            .set('Cookie', [`access_token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
  });

  describe('GET /payables/payments/upcoming-checks', () => {
      it('should get upcoming checks', async () => {
          vi.spyOn(PayablePaymentsService, 'GetUpcomingChecks').mockResolvedValue([]);
          const response = await request(app)
              .get('/payables/payments/upcoming-checks')
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual([]);
      });
  });
});
