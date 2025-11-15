const EXPLORER_BASE = 'https://trashscan.io';

export function accountUrl(pubkey: string): string {
  return `${EXPLORER_BASE}/account/${pubkey}`;
}

export function txUrl(signature: string): string {
  return `${EXPLORER_BASE}/tx/${signature}`;
}

export function nftUrl(mint: string): string {
  return `${EXPLORER_BASE}/token/${mint}`;
}