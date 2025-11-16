import { configManager, appConfig } from '@dumpsack/shared-utils';

describe('config loader', () => {
  it('loads defaults and exposes env/flags', () => {
    expect(appConfig.rpc.primary).toBeTruthy();
    expect(typeof appConfig.features.enableSwaps).toBe('boolean');
  });

  it('singleton access is stable', () => {
    const a = configManager.getConfig();
    const b = configManager.getConfig();
    expect(a.rpc.primary).toBe(b.rpc.primary);
  });
});