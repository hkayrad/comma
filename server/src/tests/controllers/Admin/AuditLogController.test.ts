import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import { AuditLogService } from '@/services/AuditLogService';
import jwt from 'jsonwebtoken';
import { UserRole } from '@comma/common/enums';
import { ADMIN_COMPANY_ID, ADMIN_USER_ID } from '@comma/common/constants';

describe('AuditLogController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const authToken = jwt.sign({ id: ADMIN_USER_ID, role: UserRole.ADMIN, companyId: ADMIN_COMPANY_ID }, process.env.JWT_SECRET as string);

  describe('GET /admin/audit-logs', () => {
    it('should return 401 when unauthorized', async () => {
      const response = await request(app).get('/admin/audit-logs');
      expect(response.status).toBe(401);
    });

    it('should fetch audit logs with pagination and filters', async () => {
      const mockResult = {
        data: [
          {
            id: 'log-1',
            company_id: ADMIN_COMPANY_ID,
            user_id: ADMIN_USER_ID,
            entity_type: 'receivable_debts',
            entity_id: 'debt-1',
            action: 'CREATE',
            old_values: null,
            new_values: { amount: 100 },
            ip_address: null,
            user_agent: null,
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      };

      vi.spyOn(AuditLogService, 'getLogs').mockResolvedValue(mockResult as any);

      const response = await request(app)
        .get('/admin/audit-logs?page=0&limit=20')
        .set('Cookie', [`access_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(AuditLogService.getLogs).toHaveBeenCalledWith(ADMIN_COMPANY_ID, 0, 20, [], []);
    });
  });
});
