import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export function formatAmount(amount: number, decimals: number = 9): string {
  return amount.toFixed(Math.min(decimals, 6)); // Max 6 decimal places for display
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function calculateMaxAmount(balance: number, decimals: number, feeEstimate: number = 0): number {
  if (decimals === 9) {
    // For SOL/GOR, leave some for fees
    return Math.max(0, balance - feeEstimate - 1000); // Leave 1000 lamports for fees
  }
  return balance;
}

export function parseAmount(input: string, decimals: number = 9): number {
  const parsed = parseFloat(input);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error('Invalid amount');
  }
  return decimals === 9 ? solToLamports(parsed) : Math.floor(parsed * Math.pow(10, decimals));
}