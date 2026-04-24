import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import ReceivableDebtsService from '@/services/Receivable/DebtsService';
import jwt from 'jsonwebtoken';

describe('ReceivableDebtsController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d470';
  const validCustomerId = 'f47ac10b-58cc-4372-a567-0e02b2c3d471';
  const validDebtId = 'f47ac10b-58cc-4372-a567-0e02b2c3d472';
  const token = jwt.sign({ id: '1', role: 1, companyId: validCompanyId }, process.env.JWT_SECRET as string);

  describe('POST /receivables/debts', () => {
    it('should create debt', async () => {
      vi.spyOn(ReceivableDebtsService, 'Create').mockResolvedValue('new-id');
      const response = await request(app)
        .post('/receivables/debts')
        .set('Cookie', [`access_token=${token}`])
        .send({ 
            customer_id: validCustomerId, amount: 100, vat: 20, currency: 'TRY', 
            exchange_rate: 1, issue_date: '2026-01-01'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('new-id');
    });
  });

  describe('GET /receivables/debts/totals', () => {
    it('should get totals', async () => {
        const mockData = { total_debts: 100, total_payments: 50, remaining_debt: 50 };
        vi.spyOn(ReceivableDebtsService, 'GetTotals').mockResolvedValue(mockData as any);
        const response = await request(app)
            .get('/receivables/debts/totals?currency=TRY')
            .set('Cookie', [`access_token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockData);
    });
  });

  describe('GET /receivables/debts', () => {
      it('should get all debts', async () => {
          const mockData = { rows: [], count: 0 };
          vi.spyOn(ReceivableDebtsService, 'GetAll').mockResolvedValue(mockData);
          const response = await request(app)
              .get('/receivables/debts?page=0&limit=10')
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual(mockData);
      });
  });

  describe('PUT /receivables/debts/:id', () => {
      it('should update debt', async () => {
          vi.spyOn(ReceivableDebtsService, 'Update').mockResolvedValue(undefined);
          const response = await request(app)
              .put(`/receivables/debts/${validDebtId}`)
              .set('Cookie', [`access_token=${token}`])
              .send({ 
                customer_id: validCustomerId, amount: 100, vat: 20, currency: 'TRY', 
                exchange_rate: 1, issue_date: '2026-01-01'
              });
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('DELETE /receivables/debts/:id', () => {
      it('should delete debt', async () => {
          vi.spyOn(ReceivableDebtsService, 'Delete').mockResolvedValue(undefined);
          const response = await request(app)
              .delete(`/receivables/debts/${validDebtId}`)
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('POST /receivables/debts/:id/restore', () => {
      it('should restore debt', async () => {
          vi.spyOn(ReceivableDebtsService, 'Restore').mockResolvedValue(undefined);
          const response = await request(app)
              .post(`/receivables/debts/${validDebtId}/restore`)
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(ReceivableDebtsService.Restore).toHaveBeenCalledWith(validDebtId, '1', validCompanyId);
      });
  });

  describe('GET /receivables/debts/upcoming-due-dates', () => {
      it('should get upcoming due dates', async () => {
          vi.spyOn(ReceivableDebtsService, 'GetUpcomingDueDates').mockResolvedValue([]);
          const response = await request(app)
              .get('/receivables/debts/upcoming-due-dates')
              .set('Cookie', [`access_token=${token}`]);
          
          expect(response.status).toBe(200);
          expect(response.body.data).toEqual([]);
      });
  });
});
