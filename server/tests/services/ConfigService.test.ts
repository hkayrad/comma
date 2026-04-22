import { describe, it, expect, afterAll } from 'vitest';
import { ConfigService } from '@/services/ConfigService';
import { Config } from '@/models';

describe('ConfigService', () => {
  const TEST_KEY = 'TEST_AUTO_CONFIG_KEY';
  const TEST_VALUE = 'test_value';

  afterAll(async () => {
    // Cleanup
    await Config.destroy({ where: { configKey: TEST_KEY } });
  });

  it('should set and get a config', async () => {
    await ConfigService.SetConfig(TEST_KEY, TEST_VALUE);
    const value = await ConfigService.GetConfig(TEST_KEY);
    expect(value).toBe(TEST_VALUE);
  });

  it('should return null for non-existent config', async () => {
    const value = await ConfigService.GetConfig('NON_EXISTENT_KEY' as any);
    expect(value).toBeNull();
  });

  it('should fetch all configs', async () => {
    await ConfigService.SetConfig(TEST_KEY, TEST_VALUE);
    const configs = await ConfigService.GetConfigs();
    expect(configs).toHaveProperty(TEST_KEY);
    expect(configs[TEST_KEY]).toBe(TEST_VALUE);
  });

  it('should start and end maintenance mode', async () => {
    await ConfigService.StartMaintenanceMode();
    expect(await ConfigService.GetConfig('maintenanceMode' as any)).toBe('active');
    
    await ConfigService.EndMaintenanceMode();
    expect(await ConfigService.GetConfig('maintenanceMode' as any)).toBe('inactive');
  });
});
