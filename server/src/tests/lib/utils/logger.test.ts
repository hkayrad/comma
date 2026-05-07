import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '@/lib/utils/logger';
import fs from 'fs';

vi.mock('@/lib/utils/env', () => ({
  env: { NODE_ENV: 'development' }
}));

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'table').mockImplementation(() => {});
    vi.spyOn(fs, 'createWriteStream').mockImplementation(() => ({
      write: vi.fn(),
      end: vi.fn(),
    } as any));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('info should call console.info', () => {
    Logger.info('test info');
    expect(console.info).toHaveBeenCalled();
  });

  it('error should call console.error', () => {
    Logger.error('test error');
    expect(console.error).toHaveBeenCalled();
  });

  it('warn should call console.warn', () => {
    Logger.warn('test warn');
    expect(console.warn).toHaveBeenCalled();
  });

  it('debug should call console.debug in development', () => {
    Logger.debug('test debug');
    expect(console.debug).toHaveBeenCalled();
  });

  it('table should call console.table', () => {
    Logger.table({ foo: 'bar' });
    expect(console.table).toHaveBeenCalled();
  });
});
