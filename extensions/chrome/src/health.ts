import { appConfig } from '@dumpsack/shared-utils';
import { checkRpcHealth } from '@dumpsack/shared-utils/health';

export async function extensionHealth() {
  const rpc = await checkRpcHealth(appConfig.rpc.primary);
  return {
    rpc,
    env: appConfig.env,
  };
}