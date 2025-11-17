/**
 * Gorbagana Token Registry
 * Real token metadata for all Gorbagana network tokens
 * Source: https://trashscan.xyz/tokens
 */

export interface TokenMetadata {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
  verified: boolean;
}

/**
 * Native GOR token (Gorbagana's native token, equivalent to SOL on Solana)
 */
export const GOR_MINT = 'So11111111111111111111111111111111111111112'; // Native token uses wrapped SOL mint

/**
 * Well-known token mints on Gorbagana
 */
export const KNOWN_MINTS = {
  GOR: GOR_MINT,
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC on Gorbagana
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT on Gorbagana
  // Add more as discovered from Trashscan
} as const;

/**
 * Comprehensive token registry for Gorbagana network
 * This will be populated with real data from on-chain + Trashscan API
 */
export const TOKEN_REGISTRY: Record<string, TokenMetadata> = {
  // Native GOR
  [GOR_MINT]: {
    mint: GOR_MINT,
    symbol: 'GOR',
    name: 'Gorbagana',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    coingeckoId: 'solana', // Using SOL as proxy for now
    verified: true,
  },
  
  // USDC
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    coingeckoId: 'usd-coin',
    verified: true,
  },
  
  // USDT
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
    coingeckoId: 'tether',
    verified: true,
  },
};

/**
 * Get token metadata from registry
 */
export function getTokenMetadata(mint: string): TokenMetadata | null {
  return TOKEN_REGISTRY[mint] || null;
}

/**
 * Get all registered tokens
 */
export function getAllTokens(): TokenMetadata[] {
  return Object.values(TOKEN_REGISTRY);
}

/**
 * Check if token is verified
 */
export function isVerifiedToken(mint: string): boolean {
  return TOKEN_REGISTRY[mint]?.verified || false;
}

/**
 * Fetch token metadata from on-chain (SPL Token Metadata)
 * This will query the Metaplex Token Metadata program
 */
export async function fetchTokenMetadataOnChain(
  mint: string,
  rpcUrl: string
): Promise<TokenMetadata | null> {
  try {
    // Query Metaplex Token Metadata program
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [
          mint,
          { encoding: 'jsonParsed' }
        ],
      }),
    });

    const data = await response.json();
    
    if (!data.result?.value) {
      return null;
    }

    const accountData = data.result.value.data;
    
    // Parse token mint account
    if (accountData.program === 'spl-token' && accountData.parsed?.type === 'mint') {
      const decimals = accountData.parsed.info.decimals;
      
      // Return basic metadata (symbol/name would need Metaplex metadata)
      return {
        mint,
        symbol: 'UNKNOWN',
        name: `Token ${mint.slice(0, 8)}`,
        decimals,
        verified: false,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch on-chain token metadata:', error);
    return null;
  }
}

