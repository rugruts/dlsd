/**
 * Tests for complete swap flow
 */
import { useSwapStore } from '../state/swapStore';
import { useAuthStore } from '../state/authStore';
import { useWalletStore } from '../state/walletStoreV2';

// Mock all dependencies
jest.mock('../state/authStore');
jest.mock('../state/walletStore');
jest.mock('../services/swap/quoteService');
jest.mock('../services/swap/swapService');

describe('swap flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth store
    (useAuthStore as jest.Mock).mockReturnValue({
      publicKey: 'mockPublicKey',
    });

    // Mock wallet store
    (useWalletStore as jest.Mock).mockReturnValue({
      refresh: jest.fn().mockResolvedValue(undefined),
    });
  });

  it('completes full swap flow', async () => {
    const mockFetchQuote = jest.fn().mockResolvedValue(undefined);
    const mockPerformSwap = jest.fn().mockResolvedValue(undefined);
    const mockRefresh = jest.fn().mockResolvedValue(undefined);

    (useSwapStore as jest.Mock).mockReturnValue({
      fetchQuote: mockFetchQuote,
      performSwap: mockPerformSwap,
      loading: false,
      error: null,
    });

    (useWalletStore as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    });

    const store = useSwapStore.getState();

    // Fetch quote
    await store.fetchQuote('inputMint', 'outputMint', '1.0');
    expect(mockFetchQuote).toHaveBeenCalledWith('inputMint', 'outputMint', '1.0');

    // Perform swap
    await store.performSwap();
    expect(mockPerformSwap).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('handles quote fetch failure', async () => {
    const mockFetchQuote = jest.fn().mockRejectedValue(new Error('Quote failed'));

    (useSwapStore as jest.Mock).mockReturnValue({
      fetchQuote: mockFetchQuote,
      loading: false,
      error: null,
      _setState: jest.fn(),
    });

    const store = useSwapStore.getState();

    await expect(store.fetchQuote('inputMint', 'outputMint', '1.0')).rejects.toThrow('Quote failed');
  });

  it('handles swap execution failure', async () => {
    const mockPerformSwap = jest.fn().mockRejectedValue(new Error('Swap failed'));
    const mockRefresh = jest.fn().mockResolvedValue(undefined);

    (useSwapStore as jest.Mock).mockReturnValue({
      performSwap: mockPerformSwap,
      loading: false,
      error: null,
      _setState: jest.fn(),
    });

    (useWalletStore as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    });

    const store = useSwapStore.getState();

    await expect(store.performSwap()).rejects.toThrow('Swap failed');
    expect(mockRefresh).not.toHaveBeenCalled(); // Should not refresh on failure
  });

  it('requires wallet to be available', async () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      publicKey: null,
    });

    const store = useSwapStore.getState();

    await expect(store.performSwap()).rejects.toThrow('No quote available or wallet not connected');
  });

  it('resets store state', () => {
    const mockSetState = jest.fn();

    (useSwapStore as jest.Mock).mockReturnValue({
      reset: jest.fn(),
      _setState: mockSetState,
    });

    const store = useSwapStore.getState();
    store.reset();

    expect(mockSetState).toHaveBeenCalledWith({
      loading: false,
      quote: undefined,
      result: undefined,
      error: undefined,
    });
  });
});