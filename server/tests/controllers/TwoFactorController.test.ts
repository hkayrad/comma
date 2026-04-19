import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../index';
import { TwoFactorService } from '../../services/TwoFactorService';
import { AuthService } from '../../services/AuthService';
import jwt from 'jsonwebtoken';

describe('TwoFactorController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validCompanyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d470';
  const token = jwt.sign({ id: '1', role: 1, companyId: validCompanyId }, process.env.JWT_SECRET as string);

  describe('GET /2fa/status', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/2fa/status');
      expect(response.status).toBe(401);
    });

    it('should return status', async () => {
      vi.spyOn(TwoFactorService, 'isEnabled').mockResolvedValue(true);

      const response = await request(app)
        .get('/2fa/status')
        .set('Cookie', [`access_token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.enabled).toBe(true);
    });
  });

  describe('POST /2fa/setup', () => {
    it('should initiate setup', async () => {
      vi.spyOn(TwoFactorService, 'isEnabled').mockResolvedValue(false);
      vi.spyOn(TwoFactorService, 'initiateSetup').mockResolvedValue({ qrCode: 'qr', secret: 'secret' });

      const response = await request(app)
        .post('/2fa/setup')
        .set('Cookie', [`access_token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.qrCode).toBe('qr');
      expect(response.body.setupToken).toBeDefined();
    });

    it('should return 400 if already enabled', async () => {
        vi.spyOn(TwoFactorService, 'isEnabled').mockResolvedValue(true);
        const response = await request(app)
          .post('/2fa/setup')
          .set('Cookie', [`access_token=${token}`]);
        expect(response.status).toBe(400);
    });
  });

  describe('POST /2fa/verify-setup', () => {
      it('should return 400 if setup token missing', async () => {
          const response = await request(app)
              .post('/2fa/verify-setup')
              .set('Cookie', [`access_token=${token}`])
              .send({ code: '123456' });
          expect(response.status).toBe(400);
      });

      it('should complete setup successfully', async () => {
          const setupToken = jwt.sign({ userId: '1', secret: 'secret', purpose: '2fa_setup' }, process.env.JWT_SECRET as string);
          vi.spyOn(TwoFactorService, 'completeSetup').mockResolvedValue({ success: true, recoveryCodes: [], message: 'ok' });

          const response = await request(app)
              .post('/2fa/verify-setup')
              .set('Cookie', [`access_token=${token}`])
              .send({ code: '123456', setupToken });
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });

  describe('POST /2fa/verify', () => {
    it('should return 401 without temp token', async () => {
      const response = await request(app).post('/2fa/verify').send({ code: '123456' });
      expect(response.status).toBe(401);
    });

    it('should verify code and set cookies', async () => {
      const tempToken = jwt.sign({ id: '1', purpose: '2fa_verification' }, process.env.JWT_SECRET as string);
      
      vi.spyOn(TwoFactorService, 'verifyLogin').mockResolvedValue({ success: true, message: 'ok' });
      vi.spyOn(AuthService, 'Complete2FALogin').mockResolvedValue({
          success: true, accessToken: 'a', refreshToken: 'r', user: { username: 'u' }
      } as any);
      
      const response = await request(app)
        .post('/2fa/verify')
        .send({ code: '123456', tempToken });

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 on verification failure', async () => {
        const tempToken = jwt.sign({ id: '1', purpose: '2fa_verification' }, process.env.JWT_SECRET as string);
        vi.spyOn(TwoFactorService, 'verifyLogin').mockResolvedValue({ success: false, message: 'fail', attemptsRemaining: 3 });

        const response = await request(app)
            .post('/2fa/verify')
            .send({ code: 'wrong', tempToken });
        
        expect(response.status).toBe(401);
        expect(response.body.attemptsRemaining).toBe(3);
    });
  });

  describe('POST /2fa/recovery', () => {
      it('should use recovery code and set cookies', async () => {
          const tempToken = jwt.sign({ id: '1', purpose: '2fa_verification' }, process.env.JWT_SECRET as string);
          vi.spyOn(TwoFactorService, 'useRecoveryCode').mockResolvedValue({ success: true, remainingCodes: 5, message: 'ok' });
          vi.spyOn(AuthService, 'Complete2FALogin').mockResolvedValue({
            success: true, accessToken: 'a', refreshToken: 'r', user: { username: 'u' }
          } as any);

          const response = await request(app)
            .post('/2fa/recovery')
            .send({ code: 'CODE', tempToken });
          
          expect(response.status).toBe(200);
          expect(response.headers['set-cookie']).toBeDefined();
      });
  });

  describe('POST /2fa/disable', () => {
      it('should disable 2fa', async () => {
          vi.spyOn(TwoFactorService, 'disable').mockResolvedValue({ success: true, message: 'disabled' });
          const response = await request(app)
            .post('/2fa/disable')
            .set('Cookie', [`access_token=${token}`])
            .send({ password: 'password' });
          
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
      });
  });
});
