/**
 * Tests for complete send flow
 */
import { useTransactionStore } from '../state/transactionStore';
import { useAuthStore } from '../state/authStore';
import { useWalletStore } from '../state/walletStore';

// Mock all dependencies
jest.mock('../state/authStore');
jest.mock('../state/walletStore');
jest.mock('../services/transactions/transactionBuilder');
jest.mock('../services/transactions/transactionSimulator');
jest.mock('../services/transactions/transactionSender');

describe('send flow', () => {
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

  it('completes full GOR send flow', async () => {
    const mockSendGOR = jest.fn().mockResolvedValue(undefined);
    const mockRefresh = jest.fn().mockResolvedValue(undefined);

    (useTransactionStore as jest.Mock).mockReturnValue({
      sendGOR: mockSendGOR,
      sending: false,
      error: null,
    });

    (useWalletStore as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    });

    const store = useTransactionStore.getState();
    await store.sendGOR('recipientAddress', 1000000);

    expect(mockSendGOR).toHaveBeenCalledWith('recipientAddress', 1000000);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('completes full SPL token send flow', async () => {
    const mockSendToken = jest.fn().mockResolvedValue(undefined);
    const mockRefresh = jest.fn().mockResolvedValue(undefined);

    (useTransactionStore as jest.Mock).mockReturnValue({
      sendToken: mockSendToken,
      sending: false,
      error: null,
    });

    (useWalletStore as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    });

    const store = useTransactionStore.getState();
    const mockToken = {
      mint: 'tokenMint',
      symbol: 'TOK',
      name: 'Token',
      balance: 100,
      decimals: 6,
    };

    await store.sendToken('recipientAddress', mockToken, 50000000);

    expect(mockSendToken).toHaveBeenCalledWith('recipientAddress', mockToken, 50000000);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('handles send failure gracefully', async () => {
    const mockSendGOR = jest.fn().mockRejectedValue(new Error('Send failed'));
    const mockRefresh = jest.fn().mockResolvedValue(undefined);

    (useTransactionStore as jest.Mock).mockReturnValue({
      sendGOR: mockSendGOR,
      sending: false,
      error: null,
      _setState: jest.fn(),
    });

    (useWalletStore as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    });

    const store = useTransactionStore.getState();

    await expect(store.sendGOR('recipientAddress', 1000000)).rejects.toThrow('Send failed');
    expect(mockRefresh).not.toHaveBeenCalled(); // Should not refresh on failure
  });

  it('updates store state during sending', async () => {
    const mockSetState = jest.fn();
    const mockSendGOR = jest.fn().mockImplementation(async () => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    (useTransactionStore as jest.Mock).mockReturnValue({
      sendGOR: mockSendGOR,
      sending: false,
      error: null,
      _setState: mockSetState,
    });

    const store = useTransactionStore.getState();
    await store.sendGOR('recipientAddress', 1000000);

    expect(mockSetState).toHaveBeenCalledWith({ sending: true, error: undefined });
  });

  it('requires wallet to be available', async () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      publicKey: null,
    });

    const store = useTransactionStore.getState();

    await expect(store.sendGOR('recipientAddress', 1000000)).rejects.toThrow('No wallet available');
  });
});