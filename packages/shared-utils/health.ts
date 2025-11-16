import { Connection } from '@solana/web3.js';

export type RpcHealth = {
  status: 'ok' | 'unhealthy';
  latencyMs: number;
  version?: string;
  error?: string;
};

export async function checkRpcHealth(rpcUrl: string, timeoutMs = 3000): Promise<RpcHealth> {
  const start = Date.now();
  try {
    const conn = new Connection(rpcUrl, { commitment: 'confirmed' });
    // simple lightweight call
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    const { blockhash } = await conn.getLatestBlockhash('confirmed');
    clearTimeout(t);
    if (!blockhash) throw new Error('no blockhash');
    const latencyMs = Date.now() - start;
    const version = await conn.getVersion().then(v => v['solana-core'] ?? JSON.stringify(v)).catch(() => undefined);
    return { status: 'ok', latencyMs, version };
  } catch (e: any) {
    return { status: 'unhealthy', latencyMs: Date.now() - start, error: String(e?.message ?? e) };
  }
}