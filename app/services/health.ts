import { appConfig, checkRpcHealth, type RpcHealth } from '@dumpsack/shared-utils';

export async function getAppHealth(): Promise<{
  rpc: RpcHealth;
  env: string;
  features: Record<string, boolean>;
}> {
  const rpc = await checkRpcHealth(appConfig.rpc.primary);
  return {
    rpc,
    env: appConfig.env,
    features: appConfig.features as Record<string, boolean>,
  };
}