import { createRpcClient } from './rpcClient';
import { RpcHealth } from './models';

const rpcClient = createRpcClient();

export async function awaitCheckHealth(): Promise<RpcHealth> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 3000);

  try {
    return await rpcClient.getHealth(abortController);
  } finally {
    clearTimeout(timeoutId);
  }
}