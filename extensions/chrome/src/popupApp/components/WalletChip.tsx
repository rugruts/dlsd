/**
 * WalletChip Component (Extension)
 * Header chip showing active wallet with avatar
 */

import React from 'react';
import { useWalletStore } from '../stores/walletStoreV2';
import { generateWalletAvatar } from '@dumpsack/shared-utils';
import { truncatePublicKey } from '@dumpsack/shared-types';

interface WalletChipProps {
  onClick: () => void;
}

export function WalletChip({ onClick }: WalletChipProps) {
  const { wallets, activeIndex } = useWalletStore();
  const activeWallet = wallets[activeIndex];

  if (!activeWallet) {
    return null;
  }

  const avatar = generateWalletAvatar(activeWallet.name, activeWallet.publicKey);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-[#123F33] hover:bg-[#1C5A49] px-3 py-2 rounded-lg border border-[#1C5A49] transition-colors"
    >
      {/* Avatar Circle */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          backgroundColor: avatar.backgroundColor,
          color: avatar.textColor,
        }}
      >
        {avatar.initials}
      </div>

      {/* Wallet Info */}
      <div className="flex flex-col items-start">
        <div className="text-[#F4F3E9] text-sm font-semibold leading-tight">
          {activeWallet.name}
        </div>
        <div className="text-[#C6D0C3] text-xs leading-tight">
          {truncatePublicKey(activeWallet.publicKey, 4)}
        </div>
      </div>

      {/* Chevron */}
      <svg
        className="w-4 h-4 text-[#C6D0C3]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

