/**
 * Tests for dashboard functionality
 */
import { useWalletStore } from '../state/walletStore';
import { getTokenList } from '../services/blockchain/tokenService';
import { getNfts } from '../services/blockchain/nftService';
import { loadCachedTokens, saveTokens } from '../services/blockchain/rpcCache';

// Mock dependencies
jest.mock('../services/blockchain/tokenService');
jest.mock('../services/blockchain/nftService');
jest.mock('../services/blockchain/rpcCache');
jest.mock('zustand');

describe('dashboard functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads cached tokens on init', async () => {
    const mockTokens = [
      { mint: 'token1', symbol: 'TOK', name: 'Token', balance: 100, decimals: 9 },
    ];

    (loadCachedTokens as jest.Mock).mockResolvedValue(mockTokens);

    const store = useWalletStore.getState();
    await store.loadCachedData();

    expect(loadCachedTokens).toHaveBeenCalled();
    expect(store.tokens).toEqual(mockTokens);
  });

  it('refreshes data from RPC and updates cache', async () => {
    const mockTokens = [
      { mint: 'token1', symbol: 'TOK', name: 'Token', balance: 100, decimals: 9 },
    ];
    const mockNfts = [
      { mint: 'nft1', name: 'NFT', owner: 'owner1' },
    ];

    (getTokenList as jest.Mock).mockResolvedValue(mockTokens);
    (getNfts as jest.Mock).mockResolvedValue(mockNfts);
    (saveTokens as jest.Mock).mockResolvedValue(undefined);

    const store = useWalletStore.getState();
    await store.refresh();

    expect(getTokenList).toHaveBeenCalled();
    expect(getNfts).toHaveBeenCalled();
    expect(saveTokens).toHaveBeenCalledWith(mockTokens);
    expect(store.tokens).toEqual(mockTokens);
    expect(store.nfts).toEqual(mockNfts);
  });

  it('handles RPC failures gracefully', async () => {
    (getTokenList as jest.Mock).mockRejectedValue(new Error('RPC Error'));
    (getNfts as jest.Mock).mockRejectedValue(new Error('RPC Error'));

    const store = useWalletStore.getState();
    await store.refresh();

    expect(store.error).toContain('Failed to load wallet data');
    expect(store.loading).toBe(false);
  });

  it('retains cached data when RPC fails', async () => {
    const mockCachedTokens = [
      { mint: 'cached', symbol: 'CAC', name: 'Cached', balance: 50, decimals: 9 },
    ];

    (loadCachedTokens as jest.Mock).mockResolvedValue(mockCachedTokens);
    (getTokenList as jest.Mock).mockRejectedValue(new Error('RPC Error'));

    const store = useWalletStore.getState();
    await store.loadCachedData();
    await store.refresh();

    expect(store.tokens).toEqual(mockCachedTokens); // Should retain cached data
    expect(store.error).toBeTruthy();
  });

  it('calculates balance from GOR token', async () => {
    const mockTokens = [
      { mint: 'gor_mint', symbol: 'GOR', name: 'Gorbagana', balance: 123.456, decimals: 9 },
      { mint: 'other', symbol: 'OTH', name: 'Other', balance: 100, decimals: 9 },
    ];

    (getTokenList as jest.Mock).mockResolvedValue(mockTokens);

    const store = useWalletStore.getState();
    await store.refresh();

    expect(store.balance).toBe(123.456);
  });
});