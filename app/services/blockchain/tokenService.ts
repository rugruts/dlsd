import { Connection, type PublicKey, GBA_TOKEN_PROGRAM_ID, appConfig } from '@dumpsack/shared-utils';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import { PriceService } from './priceService';
import { GOR_MINT, getTokenMetadata, fetchTokenMetadataOnChain } from './tokenRegistry';
import { tokenIcons } from '../../assets/tokens';
import type { TokenItem } from '../../types/wallet';

export async function getWalletBalance(pubkey: PublicKey): Promise<{ lamports: number; uiAmount: number }> {
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');
  const lamports = await connection.getBalance(pubkey);
  const uiAmount = lamports / LAMPORTS_PER_SOL;
  return { lamports, uiAmount };
}

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

export async function getTokenAccounts(pubkey: PublicKey): Promise<ParsedTokenAccount[]> {
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');
  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: GBA_TOKEN_PROGRAM_ID, // Use GBA token program ID
    });
    return accounts.value as ParsedTokenAccount[];
  } catch (error) {
    console.error('Failed to fetch token accounts:', error);
    return [];
  }
}

export async function getTokenMetadataForMint(mint: string): Promise<{ symbol: string; name: string; decimals: number } | null> {
  // First check token registry
  const registryMetadata = getTokenMetadata(mint);
  if (registryMetadata) {
    return {
      symbol: registryMetadata.symbol,
      name: registryMetadata.name,
      decimals: registryMetadata.decimals,
    };
  }

  // Fallback: fetch from on-chain
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

export async function getTokenList(pubkey: PublicKey): Promise<TokenItem[]> {
  const [balanceResult, tokenAccounts] = await Promise.all([
    getWalletBalance(pubkey),
    getTokenAccounts(pubkey),
  ]);

  const tokens: TokenItem[] = [];
  const symbolsForPricing: string[] = ['GOR'];

  // Add native GOR balance
  tokens.push({
    mint: GOR_MINT,
    symbol: 'GOR',
    name: 'Gorbagana',
    balance: balanceResult.uiAmount,
    decimals: 9,
    usdValue: 0, // Will be filled by price service
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
        const metadata = await getTokenMetadataForMint(mint);
        if (metadata) {
          tokens.push({
            mint,
            symbol: metadata.symbol,
            name: metadata.name,
            balance,
            decimals: metadata.decimals,
            usdValue: 0, // Will be filled by price service
            icon: tokenIcons[metadata.symbol as keyof typeof tokenIcons] || tokenIcons.default,
            address: account.pubkey.toBase58(),
          });
          symbolsForPricing.push(metadata.symbol);
        }
      }
    } catch (error) {
      console.error('Error processing token account:', error);
    }
  }

  // Fetch real prices for all tokens
  try {
    const prices = await PriceService.getPrices(symbolsForPricing);
    for (const token of tokens) {
      const priceData = prices[token.symbol];
      if (priceData) {
        token.usdValue = token.balance * priceData.price;
      }
    }
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
  }

  // Sort: GOR first, then by USD value descending
  return tokens.sort((a, b) => {
    if (a.symbol === 'GOR') return -1;
    if (b.symbol === 'GOR') return 1;
    return (b.usdValue || 0) - (a.usdValue || 0);
  });
}