import { describe, it, expect, afterAll } from 'vitest';
import { ConfigRepository } from '../../repositories/ConfigRepository';
import { Config } from '../../models';

describe('ConfigRepository', () => {
  const TEST_KEY = 'REPO_TEST_KEY';
  const TEST_VALUE = 'repo_value';

  afterAll(async () => {
    await Config.destroy({ where: { configKey: TEST_KEY } });
  });

  it('upsert should create a config', async () => {
    await ConfigRepository.upsert(TEST_KEY as any, TEST_VALUE as any);
    const config = await Config.findByPk(TEST_KEY);
    expect(config?.configValue).toBe(TEST_VALUE);
  });

  it('findByKey should return config', async () => {
    const config = await ConfigRepository.findByKey(TEST_KEY as any);
    expect(config?.configValue).toBe(TEST_VALUE);
  });

  it('findAll should return all configs', async () => {
    const configs = await ConfigRepository.findAll();
    expect(configs.length).toBeGreaterThan(0);
    expect(configs.find(c => c.configKey === TEST_KEY)).toBeDefined();
  });
});
