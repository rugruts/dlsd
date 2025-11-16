/**
 * Tests for DumpSack provider
 */
import { DumpSackProvider } from '../provider/DumpSackProvider';

// Mock chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    lastError: null,
  },
} as any;

// Mock window
global.window = {
  location: { origin: 'https://example.com' },
  addEventListener: jest.fn(),
} as any;

describe('DumpSackProvider', () => {
  let provider: DumpSackProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new DumpSackProvider();
  });

  it('should be properly initialized', () => {
    expect(provider.isDumpSack).toBe(true);
    expect(provider.publicKey).toBeNull();
  });

  it('should handle connect request', async () => {
    const mockResponse = { publicKey: 'testPublicKey' };
    (chrome.runtime.sendMessage as jest.Mock).mockImplementation((message, callback) => {
      callback({ success: true, result: mockResponse });
    });

    const result = await provider.connect();

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CONNECT',
        origin: 'https://example.com',
      }),
      expect.any(Function)
    );

    expect(result.publicKey.toBase58()).toBe('testPublicKey');
    expect(provider.publicKey?.toBase58()).toBe('testPublicKey');
  });

  it('should handle connection errors', async () => {
    (chrome.runtime.sendMessage as jest.Mock).mockImplementation((message, callback) => {
      callback({ success: false, error: 'Connection failed' });
    });

    await expect(provider.connect()).rejects.toThrow('Connection failed');
  });

  it('should reject signMessage when not connected', async () => {
    await expect(provider.signMessage(new Uint8Array([1, 2, 3]))).rejects.toThrow('Wallet not connected');
  });

  it('should handle signMessage when connected', async () => {
    // Mock connection
    provider.publicKey = { toBase58: () => 'testKey' } as any;
    (provider as any)._connected = true;

    const mockResponse = { signature: 'testSignature' };
    (chrome.runtime.sendMessage as jest.Mock).mockImplementation((message, callback) => {
      callback({ success: true, result: mockResponse });
    });

    const result = await provider.signMessage(new Uint8Array([1, 2, 3]));

    expect(result.signature).toBe('testSignature');
    expect(result.publicKey).toBe('testKey');
  });

  it('should handle event listeners', () => {
    const mockHandler = jest.fn();

    provider.on('connect', mockHandler);
    provider.emit('connect', { test: 'data' });

    expect(mockHandler).toHaveBeenCalledWith({ test: 'data' });

    provider.off('connect', mockHandler);
    provider.emit('connect', { test: 'data2' });

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});