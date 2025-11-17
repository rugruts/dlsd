/**
 * ManageWallets View (Extension)
 * Full-screen wallet management interface
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { useWalletStore } from '../stores/walletStoreV2';
import { generateWalletAvatar } from '@dumpsack/shared-utils';
import { MAX_WALLETS, truncatePublicKey } from '@dumpsack/shared-types';

export function ManageWallets() {
  const navigate = useNavigate();
  const {
    wallets,
    activeIndex,
    setActive,
    renameWallet,
    removeWallet,
    toggleHidden,
    addWallet,
    reorderWallets,
  } = useWalletStore();

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [newName, setNewName] = useState('');

  const handleRename = (index: number, currentName: string) => {
    setRenamingIndex(index);
    setNewName(currentName);
    setRenameModalOpen(true);
  };

  const handleSaveRename = () => {
    if (renamingIndex === null) return;

    if (!newName.trim()) {
      alert('Please enter a wallet name');
      return;
    }

    try {
      renameWallet(renamingIndex, newName.trim());
      setRenameModalOpen(false);
      setRenamingIndex(null);
      setNewName('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to rename wallet');
    }
  };

  const handleRemove = (index: number, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) {
      return;
    }

    try {
      removeWallet(index);
      alert('Wallet removed successfully');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove wallet');
    }
  };

  const handleToggleHidden = (index: number) => {
    try {
      toggleHidden(index);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to toggle visibility');
    }
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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    reorderWallets(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index === wallets.length - 1) return;
    reorderWallets(index, index + 1);
  };

  return (
    <div className="min-h-screen bg-[#0E3A2F] text-[#F4F3E9]">
      {/* Header */}
      <div className="bg-[#123F33] border-b border-[#1C5A49] px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-[#C6D0C3] hover:text-[#F4F3E9] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Manage Wallets</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {wallets.map((wallet, idx) => {
          const avatar = generateWalletAvatar(wallet.name, wallet.publicKey);
          const isActive = idx === activeIndex;

          return (
            <div
              key={wallet.index}
              className={`bg-[#123F33] rounded-xl p-4 border ${
                isActive ? 'border-[#F26A2E]' : 'border-[#1C5A49]'
              }`}
            >
              {/* Wallet Header */}
              <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor: avatar.backgroundColor,
                    color: avatar.textColor,
                  }}
                >
                  {avatar.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[#F4F3E9] text-base font-semibold">
                      {wallet.name}
                    </h3>
                    {isActive && (
                      <span className="bg-[#F26A2E] px-2 py-0.5 rounded text-white text-xs font-semibold">
                        Active
                      </span>
                    )}
                    {wallet.hidden && (
                      <span className="bg-[#666] px-2 py-0.5 rounded text-white text-xs font-semibold">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-[#C6D0C3] text-sm font-mono mt-1">
                    {truncatePublicKey(wallet.publicKey, 6)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {!isActive && (
                  <button
                    onClick={() => setActive(idx)}
                    className="bg-[#F26A2E]/10 hover:bg-[#F26A2E]/20 text-[#F26A2E] px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                  >
                    Set Active
                  </button>
                )}

                <button
                  onClick={() => handleRename(idx, wallet.name)}
                  className="bg-[#123F33] hover:bg-[#1C5A49] text-[#F4F3E9] px-3 py-1.5 rounded text-xs font-semibold border border-[#1C5A49] transition-colors flex items-center gap-1"
                >
                  <Edit2 size={12} />
                  Rename
                </button>

                <button
                  onClick={() => handleToggleHidden(idx)}
                  disabled={isActive}
                  className="bg-[#123F33] hover:bg-[#1C5A49] disabled:opacity-50 disabled:cursor-not-allowed text-[#F4F3E9] px-3 py-1.5 rounded text-xs font-semibold border border-[#1C5A49] transition-colors flex items-center gap-1"
                >
                  {wallet.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                  {wallet.hidden ? 'Show' : 'Hide'}
                </button>

                {wallets.length > 1 && (
                  <button
                    onClick={() => handleRemove(idx, wallet.name)}
                    className="bg-[#E45757]/10 hover:bg-[#E45757]/20 text-[#E45757] px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                )}

                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="bg-[#123F33] hover:bg-[#1C5A49] disabled:opacity-30 disabled:cursor-not-allowed text-[#F4F3E9] px-2 py-1.5 rounded text-xs font-semibold border border-[#1C5A49] transition-colors"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === wallets.length - 1}
                    className="bg-[#123F33] hover:bg-[#1C5A49] disabled:opacity-30 disabled:cursor-not-allowed text-[#F4F3E9] px-2 py-1.5 rounded text-xs font-semibold border border-[#1C5A49] transition-colors"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Wallet Button */}
        <button
          onClick={handleAddWallet}
          disabled={wallets.length >= MAX_WALLETS}
          className="w-full bg-[#F26A2E] hover:bg-[#D85A1E] disabled:bg-[#666] disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-colors"
        >
          + Add Wallet ({wallets.length}/{MAX_WALLETS})
        </button>
      </div>

      {/* Rename Modal */}
      {renameModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setRenameModalOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#0E3A2F] rounded-2xl border border-[#1C5A49] shadow-2xl z-50 p-6">
            <h3 className="text-[#F4F3E9] text-lg font-bold mb-4">Rename Wallet</h3>

            <label className="text-[#C6D0C3] text-sm mb-2 block">Wallet Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter wallet name"
              className="w-full bg-[#123F33] text-[#F4F3E9] px-4 py-3 rounded-xl border border-[#1C5A49] mb-4 focus:outline-none focus:border-[#F26A2E]"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRenameModalOpen(false);
                  setRenamingIndex(null);
                  setNewName('');
                }}
                className="flex-1 bg-[#123F33] hover:bg-[#1C5A49] text-[#F4F3E9] py-3 rounded-xl font-semibold border border-[#1C5A49] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="flex-1 bg-[#F26A2E] hover:bg-[#D85A1E] text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

