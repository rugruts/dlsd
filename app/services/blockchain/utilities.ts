import { createRpcClient } from './rpcClient';

const rpcClient = createRpcClient();

export async function getBlockHeight(): Promise<number> {
  return await rpcClient.getBlockHeight();
}