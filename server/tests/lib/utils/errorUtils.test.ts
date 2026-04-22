import { describe, it, expect } from 'vitest';
import { normalizeError } from '@/lib/utils/errorUtils';

describe('errorUtils', () => {
  describe('normalizeError', () => {
    it('should return the same error if input is an instance of Error', () => {
      const error = new Error('Test error');
      expect(normalizeError(error)).toBe(error);
    });

    it('should return a new Error with the string message if input is a string', () => {
      const message = 'Test message';
      const result = normalizeError(message);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe(message);
    });

    it('should return a new Error with string representation of input if input is an object', () => {
      const input = { foo: 'bar' };
      const result = normalizeError(input);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('[object Object]');
    });

    it('should return a new Error with string representation of input if input is a number', () => {
      const input = 123;
      const result = normalizeError(input);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('123');
    });
  });
});
