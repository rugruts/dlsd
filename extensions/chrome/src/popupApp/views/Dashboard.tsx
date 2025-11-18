/**
 * Dashboard View - Phantom-grade home screen (Extension)
 * ZERO scrolling needed for core actions
 * Layout: TopBar (60px) + BalanceCard (140px) + ActionRow (90px) + TokenList (scrollable)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/walletStoreV2';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { appConfig } from '../../../../../packages/shared-utils';
import { PriceService } from '../../../../../app/services/blockchain/priceService';
import { TopBar } from '../components/home/TopBar';
import { BalanceCard } from '../components/home/BalanceCard';
import { ActionRow } from '../components/home/ActionRow';
import { TokenList } from '../components/home/TokenList';
import { BottomNav } from '../components/BottomNav';

export function Dashboard() {
  const navigate = useNavigate();
  const { wallets, activeIndex } = useWalletStore();
  const activeWallet = wallets[activeIndex] || null;
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState<{ price: number; change24h: number } | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => {
    if (activeWallet) {
      loadBalance();
      loadPrice();
      loadTokens();
    }
  }, [activeWallet]);

  const loadBalance = async () => {
    if (!activeWallet) return;

    setLoading(true);
    try {
      const connection = new Connection(appConfig.rpc.primary, 'confirmed');
      const pubkey = new PublicKey(activeWallet.publicKey);
      const lamports = await connection.getBalance(pubkey);
      const bal = lamports / LAMPORTS_PER_SOL;
      setBalance(bal);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrice = async () => {
    try {
      const price = await PriceService.getPrice('GOR');
      setPriceData(price ? { price: price.price, change24h: price.change24h } : null);
    } catch (error) {
      console.error('Failed to load price:', error);
    }
  };

  const loadTokens = async () => {
    // TODO: Load real tokens from TokenService
    // For now, show GOR as the main token
    if (activeWallet && balance > 0) {
      setTokens([{
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'GOR',
        name: 'Gorbagana',
        balance: balance,
        usdValue: priceData ? balance * priceData.price : undefined,
        change24h: priceData?.change24h,
      }]);
    }
  };

  // Format balance for display
  const formatBalance = (bal: number) => {
    return bal.toFixed(4);
  };

  const formatUSD = (bal: number) => {
    if (!priceData) return '$0.00';
    return `$${(bal * priceData.price).toFixed(2)}`;
  };

  const handleTokenPress = (token: any) => {
    navigate('/tokens');
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Fixed TopBar - 60px */}
      <TopBar
        walletName={activeWallet?.name || 'Main'}
        walletAddress={activeWallet?.publicKey || ''}
        network="GOR"
        onAccountPress={() => navigate('/manage-wallets')}
        onSettingsPress={() => navigate('/settings')}
      />

      {/* Fixed BalanceCard - 140px */}
      <BalanceCard
        balanceGOR={formatBalance(balance)}
        balanceUSD={formatUSD(balance)}
        change24h={priceData?.change24h}
        loading={loading && balance === 0}
      />

      {/* Fixed ActionRow - 90px */}
      <ActionRow
        onReceive={() => navigate('/receive')}
        onSend={() => navigate('/send')}
        onSwap={() => navigate('/swap')}
        onBackup={() => navigate('/backup')}
      />

      {/* Scrollable TokenList */}
      <TokenList
        tokens={tokens}
        loading={loading}
        onTokenPress={handleTokenPress}
      />

      {/* Fixed BottomNav - 60px */}
      <BottomNav />
    </div>
  );
}

