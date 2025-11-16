import { appConfig } from '@dumpsack/shared-utils';
import { checkRpcHealth, RpcHealth } from '@dumpsack/shared-utils/health';

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