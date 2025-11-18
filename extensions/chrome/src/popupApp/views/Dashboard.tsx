/**
 * Dashboard View - Phantom-grade home screen (Extension)
 * ZERO scrolling needed for core actions
 * Layout: TopBar (60px) + BalanceCard (140px) + ActionRow (90px) + TokenList (scrollable)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/home/TopBar';
import { BalanceCard } from '../components/home/BalanceCard';
import { ActionRow } from '../components/home/ActionRow';
import { TokenList } from '../components/home/TokenList';
import { BottomNav } from '../components/BottomNav';
import { DSScreen, type Token } from '@dumpsack/shared-ui';
import { getUiTokenList } from '../../services/tokenService';
import { useWalletStore } from '../stores/walletStoreV2';

export function Dashboard() {
  const navigate = useNavigate();
  const { wallets, activeIndex } = useWalletStore();
  const activeWallet = wallets[activeIndex] || null;
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTokens = async (pubkey: string) => {
    setLoading(true);
    try {
      const list = await getUiTokenList(pubkey);
      setTokens(list);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWallet?.publicKey) {
      void loadTokens(activeWallet.publicKey);
    }
  }, [activeWallet?.publicKey]);

  const formatBalance = (bal: number) => bal.toFixed(4);

  const formatUSD = (usdValue: number) => `$${usdValue.toFixed(2)}`;

  const gorToken = tokens.find((token) => token.symbol === 'GOR');
  const gorBalance = gorToken?.balance ?? 0;
  const gorUsdValue = gorToken?.usdValue ?? 0;
  const gorChange24h = gorToken?.change24h;

  const handleTokenPress = (token: Token) => {
    navigate('/tokens', { state: { symbol: token.symbol } });
  };

  return (
    <DSScreen
      padding={false}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
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
        balanceGOR={formatBalance(gorBalance)}
        balanceUSD={formatUSD(gorUsdValue)}
        change24h={gorChange24h}
        loading={loading && !gorToken}
      />

      {/* Fixed ActionRow - 90px */}
      <ActionRow
        onReceive={() => navigate('/receive')}
        onSend={() => navigate('/send')}
        onSwap={() => navigate('/swap')}
        onBackup={() => navigate('/backup')}
      />

      {/* Scrollable TokenList */}
      <TokenList tokens={tokens} loading={loading} onTokenPress={handleTokenPress} />

      {/* Fixed BottomNav - 60px */}
      <BottomNav />
    </DSScreen>
  );
}

