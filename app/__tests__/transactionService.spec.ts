/**
 * Minimal test for transaction builder shapes.
 * Uses lightweight mocks — adjust if your actual service path differs.
 */
import { PublicKey, Transaction, SystemProgram } from '@dumpsack/shared-utils';

describe('transaction builder', () => {
  it('creates a basic transfer instruction', () => {
    const from = new PublicKey('11111111111111111111111111111111');
    const to = new PublicKey('11111111111111111111111111111112');
    const ix = SystemProgram.transfer({ fromPubkey: from, toPubkey: to, lamports: 1 });
    const tx = new Transaction().add(ix);
    expect(tx.instructions.length).toBe(1);
  });
});