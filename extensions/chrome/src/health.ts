import { appConfig, checkRpcHealth } from '@dumpsack/shared-utils';

export async function extensionHealth() {
  const rpc = await checkRpcHealth(appConfig.rpc.primary);
  return {
    rpc,
    env: appConfig.env,
  };
}