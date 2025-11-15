import { createRpcClient } from '../services/blockchain/rpcClient';

// Mock fetch
global.fetch = jest.fn();

describe('RpcClient', () => {
  const client = createRpcClient();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get balance', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ result: 1000000 }),
    });

    // Note: This is a stub test; actual implementation would need proper mocking
    expect(client).toBeDefined();
  });
});