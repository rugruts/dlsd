/**
 * BalanceCard Component - Phantom-grade balance display
 * Platform-agnostic: Works for both React Native (mobile) and React (extension)
 * Height: 140px fixed
 */

import React from 'react';

export interface BalanceCardProps {
  balanceGOR: string;
  balanceUSD: string;
  change24h?: number;
  loading?: boolean;
}

/**
 * Platform-agnostic BalanceCard logic
 * Returns formatted data for platform-specific rendering
 */
export function useBalanceCard(props: BalanceCardProps) {
  const { balanceGOR, balanceUSD, change24h, loading = false } = props;

  const changeColor = change24h && change24h >= 0 ? 'success' : 'error';
  const changeSign = change24h && change24h >= 0 ? '+' : '';
  const changeText = change24h !== undefined ? `${changeSign}${change24h.toFixed(2)}%` : null;

  return {
    loading,
    balance: {
      amount: balanceGOR,
      currency: 'GOR',
    },
    usd: {
      amount: balanceUSD,
    },
    change: changeText ? {
      text: changeText,
      color: changeColor,
    } : null,
  };
}

// Export type for platform implementations
export type BalanceCardData = ReturnType<typeof useBalanceCard>;

