import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@dumpsack/shared-utils/solana';
import { appConfig } from '@dumpsack/shared-utils';
import { TokenItem } from '../../types/wallet';
import { tokenIcons } from '../../assets/tokens';

const GOR_MINT = 'GOR111111111111111111111111111111111111111'; // Placeholder

export async function getWalletBalance(pubkey: PublicKey): Promise<{ lamports: number; uiAmount: number }> {
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');
  const lamports = await connection.getBalance(pubkey);
  const uiAmount = lamports / LAMPORTS_PER_SOL;
  return { lamports, uiAmount };
}

export async function getTokenAccounts(pubkey: PublicKey): Promise<any[]> {
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');
  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // SPL Token Program
    });
    return accounts.value;
  } catch (error) {
    console.error('Failed to fetch token accounts:', error);
    return [];
  }
}

export async function getTokenMetadata(mint: string): Promise<{ symbol: string; name: string; decimals: number } | null> {
  // For now, return hardcoded metadata for known tokens
  const knownTokens: Record<string, { symbol: string; name: string; decimals: number }> = {
    [GOR_MINT]: { symbol: 'GOR', name: 'Gorbagana', decimals: 9 },
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana', decimals: 9 },
  };

  return knownTokens[mint] || null;
}

export async function getTokenList(pubkey: PublicKey): Promise<TokenItem[]> {
  const [balanceResult, tokenAccounts] = await Promise.all([
    getWalletBalance(pubkey),
    getTokenAccounts(pubkey),
  ]);

  const tokens: TokenItem[] = [];

  // Add native SOL/GOR balance
  tokens.push({
    mint: GOR_MINT,
    symbol: 'GOR',
    name: 'Gorbagana',
    balance: balanceResult.uiAmount,
    decimals: 9,
    usdValue: balanceResult.uiAmount * 0.01, // Placeholder price
    icon: tokenIcons.GOR,
    address: pubkey.toBase58(),
  });

  // Process SPL tokens
  for (const account of tokenAccounts) {
    try {
      const parsedInfo = account.account.data.parsed.info;
      const mint = parsedInfo.mint;
      const balance = parsedInfo.tokenAmount.uiAmount;

      if (balance > 0) {
        const metadata = await getTokenMetadata(mint);
        if (metadata) {
          tokens.push({
            mint,
            symbol: metadata.symbol,
            name: metadata.name,
            balance,
            decimals: metadata.decimals,
            usdValue: balance * 1.0, // Placeholder price calculation
            icon: tokenIcons[metadata.symbol as keyof typeof tokenIcons] || tokenIcons.default,
            address: account.pubkey.toBase58(),
          });
        }
      }
    } catch (error) {
      console.error('Error processing token account:', error);
    }
  }

  // Sort: GOR first, then by USD value descending
  return tokens.sort((a, b) => {
    if (a.symbol === 'GOR') return -1;
    if (b.symbol === 'GOR') return 1;
    return (b.usdValue || 0) - (a.usdValue || 0);
  });
}