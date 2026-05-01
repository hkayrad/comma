import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import ReceivableCustomersService from '@/services/Receivable/CustomersService';

describe('Portal Endpoints', () => {
  const validCompanyId = '123e4567-e89b-12d3-a456-426614174000';
  const validTaxNumber = '1234567890';
  const invalidTaxNumber = '0987654321'; // Valid format but wrong credentials

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /portal/login', () => {
    it('should fail with invalid tax_number', async () => {
      vi.spyOn(CustomerRepository.prototype, 'findByTaxNumber').mockResolvedValue(null);

      const response = await request(app)
        .post('/portal/login')
        .send({ companyId: validCompanyId, tax_number: invalidTaxNumber });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should succeed with valid tax_number and companyId', async () => {
      vi.spyOn(CustomerRepository.prototype, 'findByTaxNumber').mockResolvedValue({
        id: 'cust-123',
        company_id: validCompanyId,
        name: 'Test Customer',
      } as any);

      const response = await request(app)
        .post('/portal/login')
        .send({ companyId: validCompanyId, tax_number: validTaxNumber });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Portal login successful');

      // Should set a cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('portal_token=');
    });
  });

  describe('GET /portal/statement', () => {
    it('should return 401 if no token', async () => {
      const response = await request(app).get('/portal/statement');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return statement data if valid token', async () => {
      // First login to get a valid token
      vi.spyOn(CustomerRepository.prototype, 'findByTaxNumber').mockResolvedValue({
        id: 'cust-123',
        company_id: validCompanyId,
        name: 'Test Customer',
      } as any);

      const loginResponse = await request(app)
        .post('/portal/login')
        .send({ companyId: validCompanyId, tax_number: validTaxNumber });

      const cookies = loginResponse.headers['set-cookie'];

      // Mock GetStatement
      const mockStatementData = {
        customer: { id: 'cust-123', name: 'Test Customer' },
        transactions: [],
      };
      
      vi.spyOn(ReceivableCustomersService, 'GetStatement').mockResolvedValue(mockStatementData as any);

      const response = await request(app)
        .get('/portal/statement')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStatementData);
    });
  });
});
