import { appConfig } from '@dumpsack/shared-utils';

export class RpcProxy {
  private rpcUrl: string;

  constructor() {
    this.rpcUrl = appConfig.rpc.primary;
  }

  async request(method: string, params: any[] = []): Promise<any> {
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    };

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`RPC error: ${result.error.message}`);
      }

      return result.result;
    } catch (error) {
      console.error('RPC proxy error:', error);
      throw error;
    }
  }

  // Common RPC methods
  async getBalance(publicKey: string): Promise<number> {
    const result = await this.request('getBalance', [publicKey]);
    return result.value;
  }

  async getLatestBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    const result = await this.request('getLatestBlockhash', [{ commitment: 'confirmed' }]);
    return {
      blockhash: result.blockhash,
      lastValidBlockHeight: result.lastValidBlockHeight,
    };
  }

  async simulateTransaction(transaction: string): Promise<any> {
    return this.request('simulateTransaction', [transaction, { encoding: 'base64' }]);
  }

  async sendRawTransaction(transaction: string): Promise<string> {
    return this.request('sendTransaction', [transaction, { encoding: 'base64' }]);
  }

  async confirmTransaction(signature: string): Promise<any> {
    return this.request('getTransaction', [signature]);
  }
}

// Export singleton instance
export const rpcProxy = new RpcProxy();