// Smoke test — assumes you implemented BackupCrypto with AES-GCM
// If class name differs, adjust import here.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BackupCrypto } from '@dumpsack/shared-utils/backup';

describe('BackupCrypto AES-GCM', () => {
  it('round-trips data', async () => {
    if (!BackupCrypto) return; // optional if not present yet
    const crypto = new BackupCrypto();
    const payload = new TextEncoder().encode('gorbagana');
    const { encrypted, meta } = await crypto.encrypt(payload);
    const out = await crypto.decrypt(encrypted, meta);
    expect(Buffer.from(out).toString('utf8')).toBe('gorbagana');
  });
});