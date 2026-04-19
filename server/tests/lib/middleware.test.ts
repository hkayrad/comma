import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware, adminMiddleware, configMiddleware } from '../../lib/middleware';
import jwt from 'jsonwebtoken';

describe('Middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: NextFunction = vi.fn();

	beforeEach(() => {
		vi.restoreAllMocks();
		mockRequest = {
			cookies: {},
			method: 'GET',
			path: '/test'
		};
		mockResponse = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		};
		nextFunction = vi.fn();
	});

	describe('authMiddleware', () => {
		it('should return 401 if no access token', () => {
			authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
			expect(mockResponse.status).toHaveBeenCalledWith(401);
		});

		it('should call next if token is valid', () => {
			const mockUser = { id: '1', role: 1 };
			mockRequest.cookies.access_token = 'valid-token';
			vi.spyOn(jwt, 'verify').mockImplementation((token, secret, callback: any) => {
				callback(null, mockUser);
			});

			authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
			expect(nextFunction).toHaveBeenCalled();
			expect(mockRequest.user).toEqual(mockUser);
		});

		it('should return 401 if token is invalid', () => {
			mockRequest.cookies.access_token = 'invalid-token';
			vi.spyOn(jwt, 'verify').mockImplementation((token, secret, callback: any) => {
				callback(new Error('Invalid token'), null);
			});

			authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
			expect(mockResponse.status).toHaveBeenCalledWith(401);
		});

        it('should handle verify errors', () => {
			mockRequest.cookies.access_token = 'token';
			vi.spyOn(jwt, 'verify').mockImplementation(() => {
                throw new Error('Verify error');
            });

			authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
			expect(mockResponse.status).toHaveBeenCalledWith(401);
		});
	});

	describe('adminMiddleware', () => {
		it('should return 403 if user role is not 99', () => {
			mockRequest.cookies.access_token = 'token';
			vi.spyOn(jwt, 'verify').mockImplementation((token, secret, callback: any) => {
				callback(null, { role: 1 });
			});

			adminMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
			expect(mockResponse.status).toHaveBeenCalledWith(403);
		});

		it('should call next if user role is 99', () => {
			mockRequest.cookies.access_token = 'token';
			vi.spyOn(jwt, 'verify').mockImplementation((token, secret, callback: any) => {
				callback(null, { role: 99 });
			});

			adminMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
			expect(nextFunction).toHaveBeenCalled();
		});

        it('should return 401 if auth fails', () => {
			mockRequest.cookies.access_token = undefined;
			adminMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
			expect(mockResponse.status).toHaveBeenCalledWith(401);
		});
	});

	describe('configMiddleware', () => {
		it('should skip auth for GET /', () => {
			mockRequest.path = '/';
			mockRequest.method = 'GET';
			configMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
			expect(nextFunction).toHaveBeenCalled();
		});

		it('should call authMiddleware for other routes', () => {
			mockRequest.path = '/other';
			configMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
			expect(mockResponse.status).toHaveBeenCalledWith(401);
		});
	});
});
