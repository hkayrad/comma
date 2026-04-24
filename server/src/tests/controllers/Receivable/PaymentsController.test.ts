import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import ReceivablePaymentsService from '@/services/Receivable/PaymentsService';
import jwt from 'jsonwebtoken';

describe('ReceivablePaymentsController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d470';
  const validCustomerId = 'f47ac10b-58cc-4372-a567-0e02b2c3d471';
  const validPaymentId = 'f47ac10b-58cc-4372-a567-0e02b2c3d473';
  const token = jwt.sign({ id: '1', role: 1, companyId: validCompanyId }, process.env.JWT_SECRET as string);

  describe('POST /receivables/payments', () => {
    it('should create payment', async () => {
      vi.spyOn(ReceivablePaymentsService, 'Create').mockResolvedValue({ id: 'new-id' } as any);
      const response = await request(app)
        .post('/receivables/payments')
        .set('Cookie', [`access_token=${token}`])
        .send({ 
            customer_id: validCustomerId, amount: 100, currency: 'TRY', 
            exchange_rate: 1, payment_date: '2026-01-01', payment_method: 'cash'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('new-id');
    });
  });

  describe('GET /receivables/payments', () => {
    it('should get all payments', async () => {
        const mockData = { rows: [], count: 0 };
        vi.spyOn(ReceivablePaymentsService, 'GetAll').mockResolvedValue(mockData);
        const response = await request(app)
            .get('/receivables/payments?page=0&limit=10')
            .set('Cookie', [`access_token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockData);
    });
  });

  describe('PUT /receivables/payments/:id', () => {
      it('should update payment', async () => {
          vi.spyOn(ReceivablePaymentsService, 'Update').mockResolvedValue(undefined);
          const response = await request(app)
              .put(`/receivables/payments/${validPaymentId}`)
              .set('Cookie', [`access_token=${token}`])
              .send({ 
                customer_id: validCustomerId, amount: 100, currency: 'TRY', 
                exchange_rate: 1, payment_date: '2026-01-01', payment_method: 'cash'
              });
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('DELETE /receivables/payments/:id', () => {
      it('should delete payment', async () => {
          vi.spyOn(ReceivablePaymentsService, 'Delete').mockResolvedValue(undefined);
          const response = await request(app)
              .delete(`/receivables/payments/${validPaymentId}`)
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('POST /receivables/payments/:id/restore', () => {
      it('should restore payment', async () => {
          vi.spyOn(ReceivablePaymentsService, 'Restore').mockResolvedValue(undefined);
          const response = await request(app)
              .post(`/receivables/payments/${validPaymentId}/restore`)
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(ReceivablePaymentsService.Restore).toHaveBeenCalledWith(validPaymentId, '1', validCompanyId);
      });
  });

  describe('GET /receivables/payments/upcoming-checks', () => {
      it('should get upcoming checks', async () => {
          vi.spyOn(ReceivablePaymentsService, 'GetUpcomingChecks').mockResolvedValue([]);
          const response = await request(app)
              .get('/receivables/payments/upcoming-checks')
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual([]);
      });
  });
});
