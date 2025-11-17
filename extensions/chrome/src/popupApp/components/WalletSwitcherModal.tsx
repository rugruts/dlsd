/**
 * WalletSwitcherModal Component (Extension)
 * Modal for switching between wallets
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/walletStoreV2';
import { generateWalletAvatar } from '@dumpsack/shared-utils';
import { MAX_WALLETS, truncatePublicKey } from '@dumpsack/shared-types';

interface WalletSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletSwitcherModal({ isOpen, onClose }: WalletSwitcherModalProps) {
  const navigate = useNavigate();
  const { wallets, activeIndex, setActive, addWallet } = useWalletStore();

  if (!isOpen) return null;

  const visibleWallets = wallets.filter((w) => !w.hidden);

  const handleSwitchWallet = (index: number) => {
    setActive(index);
    onClose();
  };

  const handleAddWallet = async () => {
    if (wallets.length >= MAX_WALLETS) {
      alert(`Maximum ${MAX_WALLETS} wallets allowed`);
      return;
    }

    try {
      await addWallet();
      alert('New wallet added successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add wallet');
    }
  };

  const handleManageWallets = () => {
    onClose();
    navigate('/manage-wallets');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-16 right-4 w-80 bg-[#0E3A2F] rounded-2xl border border-[#1C5A49] shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1C5A49]">
          <div className="flex items-center justify-between">
            <h3 className="text-[#F4F3E9] text-base font-bold">Switch Wallet</h3>
            <button
              onClick={onClose}
              className="text-[#C6D0C3] hover:text-[#F4F3E9] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Wallet List */}
        <div className="max-h-80 overflow-y-auto">
          {visibleWallets.map((wallet) => {
            const avatar = generateWalletAvatar(wallet.name, wallet.publicKey);
            const isActive = wallet.index === activeIndex;

            return (
              <button
                key={wallet.index}
                onClick={() => handleSwitchWallet(wallet.index)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#123F33] transition-colors ${
                  isActive ? 'bg-[#123F33]' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor: avatar.backgroundColor,
                    color: avatar.textColor,
                  }}
                >
                  {avatar.initials}
                </div>

                {/* Wallet Info */}
                <div className="flex-1 text-left">
                  <div className="text-[#F4F3E9] text-sm font-semibold">
                    {wallet.name}
                  </div>
                  <div className="text-[#C6D0C3] text-xs font-mono">
                    {truncatePublicKey(wallet.publicKey, 4)}
                  </div>
                </div>

                {/* Active Badge */}
                {isActive && (
                  <div className="bg-[#F26A2E] px-2 py-1 rounded text-white text-xs font-semibold">
                    Active
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-[#1C5A49] space-y-2">
          <button
            onClick={handleAddWallet}
            disabled={wallets.length >= MAX_WALLETS}
            className="w-full bg-[#F26A2E] hover:bg-[#D85A1E] disabled:bg-[#666] disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold transition-colors"
          >
            + Add Wallet ({wallets.length}/{MAX_WALLETS})
          </button>

          <button
            onClick={handleManageWallets}
            className="w-full bg-[#123F33] hover:bg-[#1C5A49] text-[#F4F3E9] py-2.5 rounded-lg font-semibold border border-[#1C5A49] transition-colors"
          >
            Manage Wallets
          </button>
        </div>
      </div>
    </>
  );
}

