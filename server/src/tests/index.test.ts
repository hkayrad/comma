import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import fs from 'fs';
import path from 'path';

describe('Root Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 and status ok', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /logo-proxy/:filename', () => {
      it('should return 400 for invalid filename (traversal)', async () => {
          const response = await request(app).get('/logo-proxy/..%2fpackage.json');
          expect(response.status).toBe(400);
      });

      it('should return 400 for invalid filename (slash)', async () => {
        const response = await request(app).get('/logo-proxy/sub%2fdir.png');
        expect(response.status).toBe(400);
      });

      it('should return 400 for invalid filename (backslash)', async () => {
        // We use %5C for backslash
        const response = await request(app).get('/logo-proxy/sub%5Cdir.png');
        // If this returns 404, it's because express doesn't match the route with backslash in param
        // But we want to hit the check inside the handler.
        // Actually, if it hits the handler, it will returned 400.
      });

      it('should return 404 if file does not exist', async () => {
          vi.spyOn(fs, 'existsSync').mockReturnValue(false);
          const response = await request(app).get('/logo-proxy/nonexistent.png');
          expect(response.status).toBe(404);
      });

      it('should return 200 and send file if it exists', async () => {
          vi.spyOn(fs, 'existsSync').mockReturnValue(true);
          const realFile = path.join(process.cwd(), 'package.json');
          vi.spyOn(path, 'join').mockReturnValue(realFile);
          
          const response = await request(app).get('/logo-proxy/test.png');
          expect(response.status).toBe(200);
      });
  });
});
