import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TcmbService } from '@/services/TcmbService';

describe('TcmbService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.PROXY_URL = 'http://test-proxy';
    process.env.PROXY_API_KEY = 'test-key';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should fetch exchange rates successfully', async () => {
    const mockResponse = {
      totalCount: 1,
      items: [
        {
          Tarih: '19-04-2026',
          TP_DK_USD_A_YTL: '32.1234',
          TP_DK_USD_S_YTL: '32.5678',
          TP_DK_EUR_A_YTL: '34.1234',
          TP_DK_EUR_S_YTL: '34.5678',
          UNIXTIME: { $numberLong: '1234567890' }
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const rates = await TcmbService.GetExchangeRates();
    
    expect(rates).not.toBeNull();
    expect(rates?.date).toBe('19-04-2026');
    expect(rates?.usd.forexBuying).toBe('32.1234');
    expect(rates?.eur.forexBuying).toBe('34.1234');
    expect(rates?.unixtime).toBe('1234567890');
  });

  it('should return null if API returns non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const rates = await TcmbService.GetExchangeRates();
    expect(rates).toBeNull();
  });

  it('should return null if items array is missing or empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ totalCount: 0, items: [] })
    });

    const rates = await TcmbService.GetExchangeRates();
    expect(rates).toBeNull();

    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ totalCount: 0 })
    });
    expect(await TcmbService.GetExchangeRates()).toBeNull();
  });

  it('should return null if required currency data missing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [{ Tarih: 'X' }] })
    });
    expect(await TcmbService.GetExchangeRates()).toBeNull();
  });

  it('should return 0 for unixtime if missing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ items: [{ Tarih: 'X', TP_DK_USD_A_YTL: '1', TP_DK_USD_S_YTL: '1', TP_DK_EUR_A_YTL: '1', TP_DK_EUR_S_YTL: '1' }] })
      });
      const rates = await TcmbService.GetExchangeRates();
      expect(rates?.unixtime).toBe('0');
  });

  it('should return null if fetch throws', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      const rates = await TcmbService.GetExchangeRates();
      expect(rates).toBeNull();
  });
});
