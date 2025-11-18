/**
 * DumpSack Wallet - Send View
 * Send tokens with DumpSack theme
 */

import React, { useState, useEffect } from 'react';

import { Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';

import { appConfig } from '@dumpsack/shared-utils';
import { DumpSackTheme } from '@dumpsack/shared-ui';

import { useWalletStore } from '../stores/walletStoreV2';

export function Send() {
  const { wallets, activeIndex } = useWalletStore();
  const activeWallet = wallets.find(w => w.index === activeIndex);
  const publicKey = activeWallet?.publicKey;
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch real balance from blockchain
  useEffect(() => {
    if (!publicKey) return;

    const fetchBalance = async () => {
      try {
        const connection = new Connection(appConfig.rpc.primary, 'confirmed');
        const pubkey = new PublicKey(publicKey);
        const lamports = await connection.getBalance(pubkey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [publicKey]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs
      if (!recipient || !amount) {
        throw new Error('Please fill in all fields');
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }

      if (amountNum > balance) {
        throw new Error('Insufficient balance');
      }

      // Build and send transaction
      const connection = new Connection(appConfig.rpc.primary, 'confirmed');
      const fromPubkey = new PublicKey(publicKey);
      const toPubkey = new PublicKey(recipient);
      const lamports = Math.floor(amountNum * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
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

      setSuccess(`Successfully sent ${amount} GOR! Signature: ${signature.slice(0, 8)}...`);
      setRecipient('');
      setAmount('');

      // Refresh balance
      const newBalance = await connection.getBalance(fromPubkey);
      setBalance(newBalance / LAMPORTS_PER_SOL);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to send transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div style={{
        padding: DumpSackTheme.spacing.lg,
        textAlign: 'center',
        backgroundColor: DumpSackTheme.colors.background,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textSecondary} strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        <p style={{
          marginTop: DumpSackTheme.spacing.md,
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          Connect a wallet to send tokens
        </p>
      </div>
    );
  }

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
        Send Tokens
      </h1>

      {success && (
        <div style={{
          padding: DumpSackTheme.spacing.md,
          borderRadius: DumpSackTheme.borderRadius.md,
          backgroundColor: `${DumpSackTheme.colors.success}20`,
          border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.success}`,
          marginBottom: DumpSackTheme.spacing.md,
        }}>
          <p style={{ fontSize: DumpSackTheme.typography.fontSize.sm, color: DumpSackTheme.colors.success }}>
            {success}
          </p>
        </div>
      )}

      {error && (
        <div style={{
          padding: DumpSackTheme.spacing.md,
          borderRadius: DumpSackTheme.borderRadius.md,
          backgroundColor: `${DumpSackTheme.colors.error}20`,
          border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.error}`,
          marginBottom: DumpSackTheme.spacing.md,
        }}>
          <p style={{ fontSize: DumpSackTheme.typography.fontSize.sm, color: DumpSackTheme.colors.error }}>
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: DumpSackTheme.spacing.md }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: DumpSackTheme.typography.fontSize.sm,
            color: DumpSackTheme.colors.textSecondary,
            marginBottom: DumpSackTheme.spacing.sm,
          }}>
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter wallet address"
            disabled={loading}
            style={{
              width: '100%',
              padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
              borderRadius: DumpSackTheme.borderRadius.md,
              backgroundColor: DumpSackTheme.colors.inputBackground,
              border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.inputBorder}`,
              color: DumpSackTheme.colors.inputText,
              fontSize: DumpSackTheme.typography.fontSize.base,
              outline: 'none',
              opacity: loading ? 0.5 : 1,
            }}
            className="ds-input"
          />
        </div>

        <div>
          <label style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: DumpSackTheme.typography.fontSize.sm,
            color: DumpSackTheme.colors.textSecondary,
            marginBottom: DumpSackTheme.spacing.sm,
          }}>
            <span>Amount (GOR)</span>
            <span>Balance: {balance.toFixed(4)}</span>
          </label>
          <input
            type="number"
            step="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={loading}
            style={{
              width: '100%',
              padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
              borderRadius: DumpSackTheme.borderRadius.md,
              backgroundColor: DumpSackTheme.colors.inputBackground,
              border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.inputBorder}`,
              color: DumpSackTheme.colors.inputText,
              fontSize: DumpSackTheme.typography.fontSize.base,
              outline: 'none',
              opacity: loading ? 0.5 : 1,
            }}
            className="ds-input"
          />
          <button
            type="button"
            onClick={() => setAmount(balance.toString())}
            style={{
              marginTop: DumpSackTheme.spacing.sm,
              fontSize: DumpSackTheme.typography.fontSize.xs,
              color: DumpSackTheme.colors.primary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Use Max
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !recipient || !amount || parseFloat(amount) <= 0}
          style={{
            width: '100%',
            padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
            borderRadius: DumpSackTheme.borderRadius.md,
            backgroundColor: DumpSackTheme.colors.buttonPrimary,
            border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.buttonPrimary}`,
            color: DumpSackTheme.colors.boneWhite,
            fontSize: DumpSackTheme.typography.fontSize.base,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            cursor: (loading || !recipient || !amount || parseFloat(amount) <= 0) ? 'not-allowed' : 'pointer',
            opacity: (loading || !recipient || !amount || parseFloat(amount) <= 0) ? 0.5 : 1,
          }}
          className="ds-button-primary"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

