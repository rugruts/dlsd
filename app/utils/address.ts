import { PublicKey } from '@dumpsack/shared-utils';
import { resolveAlias } from '../services/auth/aliasService';

export function shortAddress(pubkey: PublicKey | string): string {
  const address = typeof pubkey === 'string' ? pubkey : pubkey.toBase58();
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function resolveAddressOrAlias(input: string): Promise<PublicKey> {
  // First check if it's a valid address
  if (isValidAddress(input)) {
    return new PublicKey(input);
  }

  // Check if it's an alias (starts with @)
  if (input.startsWith('@')) {
    const alias = input.slice(1);
    const resolved = await resolveAlias(alias);
    if (resolved) {
      return new PublicKey(resolved);
    }
  }

  throw new Error('Invalid address or alias not found');
}