import { TokenItem } from '../types/wallet';

export function parseSwapAmount(input: string, token: TokenItem): number {
  const parsed = parseFloat(input);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error('Invalid amount');
  }
  return Math.floor(parsed * Math.pow(10, token.decimals));
}

export function formatSwapAmount(amount: number, decimals: number): string {
  return (amount / Math.pow(10, decimals)).toFixed(Math.min(decimals, 6));
}

export function calculateMaxSwapAmount(balance: number, decimals: number): number {
  // Leave some buffer for fees
  const buffer = decimals === 9 ? 1000 : Math.floor(balance * 0.01);
  return Math.max(0, balance - buffer);
}

export function validateSlippage(slippage: number): boolean {
  return slippage >= 0.1 && slippage <= 50; // 0.1% to 50%
}

export function formatPriceImpact(impact: number): string {
  if (impact < 0.01) return '< 0.01%';
  return `${impact.toFixed(2)}%`;
}

export function formatSwapFee(fee: string): string {
  const feeNum = parseFloat(fee);
  if (feeNum < 0.001) return '< 0.001 GOR';
  return `${feeNum.toFixed(6)} GOR`;
}