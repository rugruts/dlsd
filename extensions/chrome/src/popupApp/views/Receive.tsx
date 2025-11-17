/**
 * DumpSack Wallet - Receive View
 * Receive tokens with QR code and address display
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { DollarSign, X, AlertTriangle } from 'lucide-react';
import { useWalletStore } from '../stores/walletStoreV2';
import { solanaUri } from '@dumpsack/shared-utils';
import { truncatePublicKey } from '@dumpsack/shared-types';

export function Receive() {
  const { wallets, activeIndex } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState<string>('');
  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [amountInput, setAmountInput] = useState('');

  const activeWallet = wallets[activeIndex];
  const publicKey = activeWallet?.publicKey;

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRequestAmount = () => {
    setAmountModalOpen(true);
  };

  const handleSaveAmount = () => {
    setRequestedAmount(amountInput);
    setAmountModalOpen(false);
  };

  const handleClearAmount = () => {
    setRequestedAmount('');
    setAmountInput('');
  };

  if (!publicKey) {
    return (
      <div className="p-6 text-center bg-[#0E3A2F] min-h-full flex flex-col items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#C6D0C3" strokeWidth="2">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
        <p className="mt-4 text-sm text-[#C6D0C3]">
          Connect a wallet to receive tokens
        </p>
      </div>
    );
  }

  const qrValue = solanaUri(publicKey, requestedAmount || undefined, 'DumpSack');

  return (
    <div className="p-6 bg-[#0E3A2F] min-h-full">
      <h1 className="text-xl font-bold text-[#F4F3E9] mb-6">
        Receive Tokens
      </h1>

      <div className="text-center flex flex-col gap-4">
        {/* Wallet Name */}
        {activeWallet && (
          <p className="text-[#C6D0C3] text-sm">
            {activeWallet.name} • {truncatePublicKey(publicKey, 4)}
          </p>
        )}

        {/* QR Code */}
        <div className="mx-auto p-6 bg-white rounded-2xl">
          <QRCodeSVG
            value={qrValue}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        </div>

        {/* Requested Amount */}
        {requestedAmount && (
          <div className="bg-[#F26A2E]/10 px-4 py-2 rounded-lg inline-block mx-auto">
            <p className="text-[#F26A2E] text-sm font-semibold">
              Requesting: {requestedAmount} GOR
            </p>
          </div>
        )}

        {/* Address */}
        <div>
          <p className="text-sm text-[#C6D0C3] mb-2">
            Your Wallet Address
          </p>
          <button
            onClick={copyAddress}
            className="w-full p-4 rounded-xl bg-[#123F33] border border-[#1C5A49] hover:bg-[#1C5A49] transition-colors"
          >
            <p className="font-mono text-xs text-[#F4F3E9] break-all">
              {publicKey}
            </p>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={copyAddress}
            className="w-full bg-[#F26A2E] hover:bg-[#D85A1E] text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Address
              </>
            )}
          </button>

          <button
            onClick={handleRequestAmount}
            className="w-full bg-[#123F33] hover:bg-[#1C5A49] text-[#F4F3E9] py-3 px-6 rounded-xl font-semibold border border-[#1C5A49] transition-colors flex items-center justify-center gap-2"
          >
            <DollarSign size={20} />
            {requestedAmount ? 'Change Amount' : 'Request Amount'}
          </button>

          {requestedAmount && (
            <button
              onClick={handleClearAmount}
              className="w-full bg-[#123F33] hover:bg-[#1C5A49] text-[#F4F3E9] py-3 px-6 rounded-xl font-semibold border border-[#1C5A49] transition-colors flex items-center justify-center gap-2"
            >
              <X size={20} />
              Clear Amount
            </button>
          )}
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30 text-left">
          <p className="text-xs font-semibold text-yellow-500 mb-1 flex items-center gap-1">
            <AlertTriangle size={14} />
            Important
          </p>
          <p className="text-xs text-[#C6D0C3]">
            Only send Gorbagana (GOR) and GOR-based tokens to this address.
            Sending other assets may result in permanent loss.
          </p>
        </div>
      </div>

      {/* Request Amount Modal */}
      {amountModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setAmountModalOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#0E3A2F] rounded-2xl border border-[#1C5A49] shadow-2xl z-50 p-6">
            <h3 className="text-[#F4F3E9] text-lg font-bold mb-4">Request Amount</h3>

            <label className="text-[#C6D0C3] text-sm mb-2 block">Amount (GOR)</label>
            <input
              type="text"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#123F33] text-[#F4F3E9] px-4 py-3 rounded-xl border border-[#1C5A49] mb-4 text-lg focus:outline-none focus:border-[#F26A2E]"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAmountModalOpen(false);
                  setAmountInput(requestedAmount);
                }}
                className="flex-1 bg-[#123F33] hover:bg-[#1C5A49] text-[#F4F3E9] py-3 rounded-xl font-semibold border border-[#1C5A49] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAmount}
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

