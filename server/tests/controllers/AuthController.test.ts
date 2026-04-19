import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../index';
import { AuthService } from '../../services/AuthService';

describe('Auth Controller', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /login', () => {
    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: 'nonexistentuser', password: 'wrongpassword' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing credentials (validation error)', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: '' });
      
      expect(response.status).toBe(400);
    });

    it('should return 200 and cookies for valid credentials', async () => {
      vi.spyOn(AuthService, 'Login').mockResolvedValue({
        success: true,
        requires2FA: false,
        accessToken: 'access',
        refreshToken: 'refresh',
        tempToken: null,
        message: 'ok',
        user: { id: '1', username: 'test', role: 1 }
      });

      const response = await request(app)
        .post('/login')
        .send({ username: 'test', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('test');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return requires2FA true if 2FA is enabled', async () => {
      vi.spyOn(AuthService, 'Login').mockResolvedValue({
        success: true,
        requires2FA: true,
        accessToken: null,
        refreshToken: null,
        tempToken: 'temp-token',
        message: '2fa required',
        user: { id: '1', username: 'test', role: 1 }
      });

      const response = await request(app)
        .post('/login')
        .send({ username: 'test', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.requires2FA).toBe(true);
      expect(response.body.tempToken).toBe('temp-token');
    });
  });

  describe('POST /refresh', () => {
    it('should return 401 without refresh token', async () => {
      const response = await request(app).post('/refresh');
      expect(response.status).toBe(401);
    });

    it('should return 401 if refresh fails', async () => {
      vi.spyOn(AuthService, 'RefreshToken').mockResolvedValue({
        success: false, message: 'failed', accessToken: null, refreshToken: null, user: null
      });

      const response = await request(app)
        .post('/refresh')
        .set('Cookie', ['refresh_token=bad-token']);
      
      expect(response.status).toBe(401);
    });

    it('should return 200 and new cookies on success', async () => {
      vi.spyOn(AuthService, 'RefreshToken').mockResolvedValue({
        success: true, message: 'ok', accessToken: 'new-access', refreshToken: 'new-refresh', user: { id: '1', username: 'test', role: 1 }
      });

      const response = await request(app)
        .post('/refresh')
        .set('Cookie', ['refresh_token=valid-token']);
      
      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.body.username).toBe('test');
    });
  });

  describe('POST /logout', () => {
    it('should call AuthService.Logout and clear cookies', async () => {
      vi.spyOn(AuthService, 'Logout').mockResolvedValue(true);

      const response = await request(app)
        .post('/logout')
        .set('Cookie', ['refresh_token=valid-token']);

      expect(response.status).toBe(200);
      expect(AuthService.Logout).toHaveBeenCalledWith('valid-token');
      
      const setCookie = response.headers['set-cookie'] || [];
      const hasClearAccess = setCookie.some((c: string) => c.startsWith('access_token=;'));
      const hasClearRefresh = setCookie.some((c: string) => c.startsWith('refresh_token=;'));
      expect(hasClearAccess).toBe(true);
      expect(hasClearRefresh).toBe(true);
    });

    it('should clear cookies even without refresh token in request', async () => {
      const response = await request(app).post('/logout');
      expect(response.status).toBe(200);
      
      const setCookie = response.headers['set-cookie'] || [];
      const hasClearAccess = setCookie.some((c: string) => c.startsWith('access_token=;'));
      const hasClearRefresh = setCookie.some((c: string) => c.startsWith('refresh_token=;'));
      expect(hasClearAccess).toBe(true);
      expect(hasClearRefresh).toBe(true);
    });
  });
});
