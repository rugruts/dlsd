import { Connection, PublicKey, Commitment, SendOptions, VersionedTransaction } from '@solana/web3.js';
import { RpcClientConfig, TokenHolding, NftItem, RpcError, RpcHealth, RpcErrorType } from './models';
import { parseTokenAccounts, parseNftAccounts } from './mappers';

export class RpcClient {
  private connection: Connection;
  private config: RpcClientConfig;
  private fallbackConnection?: Connection;

  constructor(config: RpcClientConfig) {
    this.config = config;
    this.connection = new Connection(config.primaryRpc, {
      commitment: config.commitment,
      confirmTransactionInitialTimeout: config.timeoutMs,
    });

    if (config.fallbackRpc) {
      this.fallbackConnection = new Connection(config.fallbackRpc, {
        commitment: config.commitment,
        confirmTransactionInitialTimeout: config.timeoutMs,
      });
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    abortController?: AbortController
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        if (abortController?.signal.aborted) {
          throw new Error('Operation aborted');
        }

        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.config.maxRetries) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw this.classifyError(lastError);
  }

  private classifyError(error: Error): RpcError {
    const message = error.message.toLowerCase();

    let type: RpcErrorType = 'network';
    let userMessage = 'Network error occurred';

    if (message.includes('timeout') || message.includes('aborted')) {
      type = 'timeout';
      userMessage = 'Request timed out. Please try again.';
    } else if (message.includes('invalid') || message.includes('parameter')) {
      type = 'invalid_params';
      userMessage = 'Invalid request parameters.';
    } else if (message.includes('preflight') || message.includes('simulation')) {
      type = 'preflight_failure';
      userMessage = 'Transaction simulation failed.';
    } else if (message.includes('rate') || message.includes('limit')) {
      type = 'rate_limited';
      userMessage = 'Too many requests. Please wait and try again.';
    }

    return {
      code: (error as any)?.code?.toString(),
      message: userMessage,
      context: { originalError: error.message, type },
    };
  }

  async getBalance(pubkey: PublicKey, abortController?: AbortController): Promise<bigint> {
    return this.withRetry(async () => {
      const balance = await this.connection.getBalance(pubkey, this.config.commitment);
      return BigInt(balance);
    }, abortController);
  }

  async getTokenAccounts(owner: PublicKey, abortController?: AbortController): Promise<TokenHolding[]> {
    return this.withRetry(async () => {
      const accounts = await this.connection.getTokenAccountsByOwner(owner, {
        programId: PublicKey.default, // TOKEN_PROGRAM_ID
      });

      return parseTokenAccounts(accounts.value);
    }, abortController);
  }

  async getNFTs(owner: PublicKey, abortController?: AbortController): Promise<NftItem[]> {
    return this.withRetry(async () => {
      const accounts = await this.connection.getTokenAccountsByOwner(owner, {
        programId: PublicKey.default, // TOKEN_PROGRAM_ID
      });

      return parseNftAccounts(accounts.value);
    }, abortController);
  }

  async getLatestBlockhash(abortController?: AbortController): Promise<string> {
    return this.withRetry(async () => {
      const { blockhash } = await this.connection.getLatestBlockhash(this.config.commitment);
      return blockhash;
    }, abortController);
  }

  async sendRawTransaction(
    raw: Uint8Array,
    options?: SendOptions,
    abortController?: AbortController
  ): Promise<string> {
    return this.withRetry(async () => {
      return await this.connection.sendRawTransaction(raw, {
        ...options,
        skipPreflight: false,
      });
    }, abortController);
  }

  async getVersion(abortController?: AbortController): Promise<any> {
    return this.withRetry(async () => {
      return await this.connection.getVersion();
    }, abortController);
  }

  async getHealth(abortController?: AbortController): Promise<RpcHealth> {
    const startTime = Date.now();

    try {
      await this.withRetry(async () => {
        await this.connection.getLatestBlockhash(this.config.commitment);
      }, abortController);

      const latencyMs = Date.now() - startTime;
      return { status: 'ok', latencyMs };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return { status: 'unhealthy', latencyMs };
    }
  }

  async getBlockHeight(abortController?: AbortController): Promise<number> {
    return this.withRetry(async () => {
      return await this.connection.getBlockHeight(this.config.commitment);
    }, abortController);
  }

  async simulateTransaction(tx: Transaction, abortController?: AbortController): Promise<any> {
    return this.withRetry(async () => {
      return await this.connection.simulateTransaction(tx);
    }, abortController);
  }

  async getAccountInfo(pubkey: PublicKey, abortController?: AbortController): Promise<any> {
    return this.withRetry(async () => {
      return await this.connection.getAccountInfo(pubkey, this.config.commitment);
    }, abortController);
  }
}

export function createRpcClient(config: Partial<RpcClientConfig> = {}): RpcClient {
  const defaultConfig: RpcClientConfig = {
    primaryRpc: process.env.EXPO_PUBLIC_GBA_RPC_PRIMARY || 'https://rpc.gorbagana.wtf/',
    fallbackRpc: process.env.EXPO_PUBLIC_GBA_RPC_FALLBACK,
    commitment: (process.env.EXPO_PUBLIC_DEFAULT_COMMITMENT as Commitment) || 'confirmed',
    timeoutMs: 30000,
    maxRetries: 3,
  };

  return new RpcClient({ ...defaultConfig, ...config });
}