import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '@/lib/errors/AppError';

describe('AppError', () => {
  it('should create an AppError with default values', () => {
    const error = new AppError('test error');
    expect(error.message).toBe('test error');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('should create an AppError with custom values', () => {
    const error = new AppError('custom error', 400, false);
    expect(error.message).toBe('custom error');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(false);
  });

  it('ValidationError should have status code 400', () => {
    const error = new ValidationError();
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Validation failed');
  });

  it('NotFoundError should have status code 404', () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('UnauthorizedError should have status code 401', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('ForbiddenError should have status code 403', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Forbidden');
  });
});
