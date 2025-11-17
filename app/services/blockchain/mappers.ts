import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenHolding, NftItem } from './models';

export function mapTokenAccountToHolding(accountInfo: any, mint: string): TokenHolding {
  // Parse SPL token account data
  // This is a simplified version; in production, use proper SPL parsing
  const amount = BigInt(accountInfo.amount || 0);
  const decimals = accountInfo.decimals || 9;

  return {
    mint,
    amount,
    decimals,
    // symbol would be fetched from metadata in production
  };
}

export function mapNftAccountToItem(mint: string, metadata: any): NftItem {
  // Stubbed NFT metadata fetcher
  // In production, fetch from Metaplex or similar
  return {
    mint,
    name: metadata?.name || `NFT ${mint.slice(0, 8)}`,
    image: metadata?.image,
  };
}

export function parseTokenAccounts(accounts: any[]): TokenHolding[] {
  return accounts
    .filter(account => account.account.owner === TOKEN_PROGRAM_ID.toBase58())
    .map(account => {
      const mint = account.account.data.parsed?.info?.mint;
      if (!mint) return null;
      return mapTokenAccountToHolding(account.account.data.parsed?.info, mint);
    })
    .filter(Boolean) as TokenHolding[];
}

export function parseNftAccounts(accounts: any[]): NftItem[] {
  // Simplified: assume accounts with amount=1 and no freeze authority are NFTs
  return accounts
    .filter(account =>
      account.account.data.parsed?.info?.tokenAmount?.uiAmount === 1 &&
      !account.account.data.parsed?.info?.delegate
    )
    .map(account => {
      const mint = account.account.data.parsed?.info?.mint;
      if (!mint) return null;
      // Stub metadata
      return mapNftAccountToItem(mint, {});
    })
    .filter(Boolean) as NftItem[];
}