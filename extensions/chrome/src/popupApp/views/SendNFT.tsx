/**
 * DumpSack Wallet - Send NFT View
 * Transfer NFTs with DumpSack theme
 */

import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';
import { appConfig, GBA_TOKEN_PROGRAM_ID, GBA_ASSOCIATED_TOKEN_PROGRAM_ID } from '@dumpsack/shared-utils';
import { DumpSackTheme } from '@dumpsack/shared-ui';
import { useWalletStore } from '../stores/walletStoreV2';

interface SendNFTProps {
  nftMint: string;
  nftName?: string;
  onClose?: () => void;
}

export function SendNFT({ nftMint, nftName, onClose }: SendNFTProps) {
  const { wallets, activeIndex } = useWalletStore();
  const activeWallet = wallets.find(w => w.index === activeIndex);
  const publicKey = activeWallet?.publicKey;
  
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!recipient) {
        throw new Error('Please enter recipient address');
      }

      const connection = new Connection(appConfig.rpc.primary, 'confirmed');
      const fromPubkey = new PublicKey(publicKey);
      const toPubkey = new PublicKey(recipient);
      const mint = new PublicKey(nftMint);

      // Get ATAs
      const fromATA = await getAssociatedTokenAddress(mint, fromPubkey, false, GBA_TOKEN_PROGRAM_ID, GBA_ASSOCIATED_TOKEN_PROGRAM_ID);
      const toATA = await getAssociatedTokenAddress(mint, toPubkey, false, GBA_TOKEN_PROGRAM_ID, GBA_ASSOCIATED_TOKEN_PROGRAM_ID);

      const transaction = new Transaction();

      // Check if recipient ATA exists, create if not
      const toATAInfo = await connection.getAccountInfo(toATA);
      if (!toATAInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromPubkey,
            toATA,
            toPubkey,
            mint,
            GBA_TOKEN_PROGRAM_ID,
            GBA_ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Add transfer instruction (NFTs have amount = 1)
      transaction.add(
        createTransferInstruction(
          fromATA,
          toATA,
          fromPubkey,
          1n, // NFT amount is always 1
          [],
          GBA_TOKEN_PROGRAM_ID
        )
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Get mnemonic and derive keypair for signing
      const { getMnemonic } = useWalletStore.getState();
      const mnemonic = await getMnemonic();

      // Derive keypair from mnemonic
      const { deriveWalletAtIndex } = await import('@dumpsack/shared-utils');
      const { keypair } = deriveWalletAtIndex(mnemonic, activeWallet!.index);

      // Sign and send transaction
      transaction.sign(keypair);
      const signature = await connection.sendRawTransaction(transaction.serialize());

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      setSuccess(`NFT transferred successfully! Signature: ${signature.slice(0, 8)}...`);
      setRecipient('');
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err) {
      console.error('NFT transfer failed:', err);
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: DumpSackTheme.spacing.lg,
      backgroundColor: DumpSackTheme.colors.background,
      minHeight: '100%',
    }}>
      <h1 style={{
        fontSize: DumpSackTheme.typography.fontSize.xl,
        fontWeight: DumpSackTheme.typography.fontWeight.bold,
        color: DumpSackTheme.colors.text,
        marginBottom: DumpSackTheme.spacing.lg,
      }}>
        Send NFT
      </h1>

      <form onSubmit={handleSendNFT} style={{ display: 'flex', flexDirection: 'column', gap: DumpSackTheme.spacing.md }}>
        <div>
          <label style={{ fontSize: DumpSackTheme.typography.fontSize.sm, color: DumpSackTheme.colors.textSecondary }}>
            NFT: {nftName || nftMint.slice(0, 8)}
          </label>
        </div>

        <div>
          <label style={{ fontSize: DumpSackTheme.typography.fontSize.sm, color: DumpSackTheme.colors.textSecondary, marginBottom: DumpSackTheme.spacing.sm }}>
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient address"
            disabled={loading}
            style={{
              width: '100%',
              padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
              borderRadius: DumpSackTheme.borderRadius.md,
              backgroundColor: DumpSackTheme.colors.inputBackground,
              border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.inputBorder}`,
              color: DumpSackTheme.colors.inputText,
              fontSize: DumpSackTheme.typography.fontSize.sm,
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#ff6b6b', fontSize: DumpSackTheme.typography.fontSize.sm }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: '#51cf66', fontSize: DumpSackTheme.typography.fontSize.sm }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: `${DumpSackTheme.spacing.md}px`,
            borderRadius: DumpSackTheme.borderRadius.md,
            backgroundColor: loading ? '#666' : '#F26A2E',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: DumpSackTheme.typography.fontSize.sm,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          }}
        >
          {loading ? 'Sending...' : 'Send NFT'}
        </button>
      </form>
    </div>
  );
}

