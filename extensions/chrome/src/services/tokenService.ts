import { Connection, GBA_TOKEN_PROGRAM_ID, appConfig } from '@dumpsack/shared-utils';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { PriceService } from '../../../../app/services/blockchain/priceService';
import { GOR_MINT, getTokenMetadata, fetchTokenMetadataOnChain } from '../../../../app/services/blockchain/tokenRegistry';
import type { Token } from '@dumpsack/shared-ui';

interface ParsedTokenAccount {
  pubkey: PublicKey;
  account: {
    data: {
      parsed: {
        info: {
          mint: string;
          owner: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number;
            uiAmountString: string;
          };
        };
      };
    };
  };
}

async function getWalletBalance(pubkey: PublicKey): Promise<number> {
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');
  const lamports = await connection.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

async function getTokenAccounts(pubkey: PublicKey): Promise<ParsedTokenAccount[]> {
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');

  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: GBA_TOKEN_PROGRAM_ID,
    });

    return accounts.value as ParsedTokenAccount[];
  } catch (error) {
    console.error('Failed to fetch token accounts:', error);
    return [];
  }
}

async function getTokenMetadataForMint(mint: string): Promise<{ symbol: string; name: string; decimals: number } | null> {
  const registryMetadata = getTokenMetadata(mint);
  if (registryMetadata) {
    return {
      symbol: registryMetadata.symbol,
      name: registryMetadata.name,
      decimals: registryMetadata.decimals,
    };
  }

  const onChainMetadata = await fetchTokenMetadataOnChain(mint, appConfig.rpc.primary);
  if (onChainMetadata) {
    return {
      symbol: onChainMetadata.symbol,
      name: onChainMetadata.name,
      decimals: onChainMetadata.decimals,
    };
  }

  return null;
}

/**
 * getUiTokenList
 * Extension-friendly token list with real on-chain balances and prices.
 * Returns data shaped for shared TokenList/DSTokenRow components.
 */
export async function getUiTokenList(pubkeyBase58: string): Promise<Token[]> {
  const pubkey = new PublicKey(pubkeyBase58);

  const [nativeBalance, tokenAccounts] = await Promise.all([
    getWalletBalance(pubkey),
    getTokenAccounts(pubkey),
  ]);

  const tokens: Token[] = [];
  const symbolsForPricing = new Set<string>();

  // Native GOR balance
  tokens.push({
    mint: GOR_MINT,
    symbol: 'GOR',
    name: 'Gorbagana',
    balance: nativeBalance,
    usdValue: undefined,
    change24h: undefined,
    icon: undefined,
  });
  symbolsForPricing.add('GOR');

  // SPL tokens
  for (const account of tokenAccounts) {
    try {
      const parsedInfo = account.account.data.parsed.info;
      const mint = parsedInfo.mint;
      const balance = parsedInfo.tokenAmount.uiAmount;

      if (balance > 0) {
        const metadata = await getTokenMetadataForMint(mint);
        if (metadata) {
          tokens.push({
            mint,
            symbol: metadata.symbol,
            name: metadata.name,
            balance,
            usdValue: undefined,
            change24h: undefined,
            icon: undefined,
          });
          symbolsForPricing.add(metadata.symbol);
        }
      }
    } catch (error) {
      console.error('Error processing token account:', error);
    }
  }

  // Real prices via CoinGecko-backed PriceService
  try {
    const prices = await PriceService.getPrices(Array.from(symbolsForPricing));
    for (const token of tokens) {
      const priceData = prices[token.symbol];
      if (priceData) {
        token.usdValue = token.balance * priceData.price;
        token.change24h = priceData.change24h;
      }
    }
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
  }

  // Sort: GOR first, then by USD value desc
  return tokens.sort((a, b) => {
    if (a.symbol === 'GOR') return -1;
    if (b.symbol === 'GOR') return 1;
    const aValue = a.usdValue ?? 0;
    const bValue = b.usdValue ?? 0;
    return bValue - aValue;
  });
}

