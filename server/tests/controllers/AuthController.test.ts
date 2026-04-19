import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../index';

describe('Auth Controller', () => {
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
  });
});
