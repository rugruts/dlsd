import { transactionService } from '../services/transactions/transactionService';
import { PublicKey } from '@solana/web3.js';

describe('TransactionService', () => {
  it('should build transfer tx', async () => {
    const from = new PublicKey('11111111111111111111111111111112');
    const to = new PublicKey('11111111111111111111111111111112');
    const amount = BigInt(1000000);

    const tx = await transactionService.buildTransferTx({ from, to, amount });

    expect(tx).toBeDefined();
    expect(tx.instructions.length).toBeGreaterThan(0);
  });
});