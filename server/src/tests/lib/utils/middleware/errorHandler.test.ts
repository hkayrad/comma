import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '@/lib/utils/middleware/errorHandler';
import { AppError, ValidationError } from '@/lib/errors/AppError';
import { Request, Response } from 'express';

describe('errorHandler', () => {
  const mockRequest = {} as Request;
  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const mockNext = vi.fn();

  it('should handle AppError with status < 500', () => {
    const error = new ValidationError('Invalid data');
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid data',
    });
  });

  it('should handle AppError with status >= 500', () => {
    const error = new AppError('Server failure', 500);
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server failure',
    });
  });

  it('should handle generic Error', () => {
    const error = new Error('Unexpected bug');
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    // In test environment, it should show the error message
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected bug',
    });
  });
});
