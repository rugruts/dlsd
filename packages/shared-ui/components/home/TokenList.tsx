/**
 * TokenList Component - Phantom-grade token list
 * Platform-agnostic: Works for both React Native (mobile) and React (extension)
 */

import React from 'react';

export interface Token {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  usdValue?: number;
  change24h?: number;
  icon?: string;
}

export interface TokenListProps {
  tokens: Token[];
  loading?: boolean;
  onTokenPress: (token: Token) => void;
}

export interface TokenItemData {
  mint: string;
  symbol: string;
  name: string;
  balance: string;
  usdValue: string | null;
  change: {
    text: string;
    color: 'success' | 'error';
  } | null;
  icon: string | null;
  iconFallback: string;
  onPress: () => void;
}

/**
 * Platform-agnostic TokenList logic
 * Returns formatted token data for platform-specific rendering
 */
export function useTokenList(props: TokenListProps) {
  const { tokens, loading = false, onTokenPress } = props;

  const formatTokenItem = (token: Token): TokenItemData => {
    const changeColor = token.change24h && token.change24h >= 0 ? 'success' : 'error';
    const changeSign = token.change24h && token.change24h >= 0 ? '+' : '';
    const changeText = token.change24h !== undefined 
      ? `${changeSign}${token.change24h.toFixed(1)}%` 
      : null;

    return {
      mint: token.mint,
      symbol: token.symbol,
      name: token.name,
      balance: token.balance.toFixed(4),
      usdValue: token.usdValue ? `$${token.usdValue.toFixed(2)}` : null,
      change: changeText ? {
        text: changeText,
        color: changeColor as 'success' | 'error',
      } : null,
      icon: token.icon || null,
      iconFallback: token.symbol.slice(0, 2),
      onPress: () => onTokenPress(token),
    };
  };

  const tokenItems = tokens.map(formatTokenItem);

  return {
    loading,
    isEmpty: tokens.length === 0,
    tokens: tokenItems,
  };
}

// Export type for platform implementations
export type TokenListData = ReturnType<typeof useTokenList>;

