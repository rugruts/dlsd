/**
 * Tests for staking overview functionality
 */
import { getStakeOverview } from '../services/staking/stakeAccountService';

// Mock fetch
global.fetch = jest.fn();

describe('getStakeOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should aggregate stake accounts into overview', async () => {
    const mockAccounts = [
      {
        pubkey: 'stake1',
        account: {
          lamports: 2000000000, // 2 GOR
        },
      },
      {
        pubkey: 'stake2',
        account: {
          lamports: 1000000000, // 1 GOR
        },
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: mockAccounts }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: 1000000 }), // 0.001 GOR rent
      });

    const overview = await getStakeOverview('mockPublicKey');

    expect(overview.total).toBe(3000000000); // 3 GOR
    expect(overview.accounts).toHaveLength(2);
    expect(overview.aprEstimate).toBeGreaterThan(0);
  });

  it('should handle RPC errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('RPC failed'));

    await expect(getStakeOverview('mockPublicKey')).rejects.toThrow('Failed to load stake accounts');
  });
});