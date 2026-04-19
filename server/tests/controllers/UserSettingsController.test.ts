import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../index';
import { UserSettingsService } from '../../services/UserSettingsService';
import jwt from 'jsonwebtoken';

describe('UserSettingsController', () => {
  describe('PUT /settings/username', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/settings/username')
        .send({ newUsername: 'newuser', currentPassword: 'password' });
      expect(response.status).toBe(401);
    });

    it('should update username', async () => {
      vi.spyOn(UserSettingsService, 'UpdateUsername').mockResolvedValue(undefined);

      const token = jwt.sign({ id: '1', role: 1, companyId: '1' }, process.env.JWT_SECRET as string);

      const response = await request(app)
        .put('/settings/username')
        .set('Cookie', [`access_token=${token}`])
        .send({ newUsername: 'newuser', currentPassword: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(UserSettingsService.UpdateUsername).toHaveBeenCalledWith('1', 'newuser', 'password');
    });

    it('should return 400 for invalid data', async () => {
      const token = jwt.sign({ id: '1', role: 1, companyId: '1' }, process.env.JWT_SECRET as string);
      
      const response = await request(app)
        .put('/settings/username')
        .set('Cookie', [`access_token=${token}`])
        .send({ newUsername: '', currentPassword: 'password' });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /settings/password', () => {
    it('should update password', async () => {
      vi.spyOn(UserSettingsService, 'UpdatePassword').mockResolvedValue(undefined);

      const token = jwt.sign({ id: '1', role: 1, companyId: '1' }, process.env.JWT_SECRET as string);

      const response = await request(app)
        .put('/settings/password')
        .set('Cookie', [`access_token=${token}`])
        .send({ currentPassword: 'password', newPassword: 'newpassword' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(UserSettingsService.UpdatePassword).toHaveBeenCalledWith('1', 'password', 'newpassword');
    });

    it('should return 400 for invalid password data', async () => {
      const token = jwt.sign({ id: '1', role: 1, companyId: '1' }, process.env.JWT_SECRET as string);
      
      const response = await request(app)
        .put('/settings/password')
        .set('Cookie', [`access_token=${token}`])
        .send({ currentPassword: 'password', newPassword: 'short' });

      expect(response.status).toBe(400);
    });
  });
});
