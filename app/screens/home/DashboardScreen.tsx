/**
 * DashboardScreen - Phantom-grade home screen
 * ZERO scrolling needed for core actions
 * Layout: TopBar (60px) + BalanceCard (140px) + ActionRow (90px) + TokenList (scrollable)
 */

import React, { useEffect, useState } from 'react';
import { SafeAreaView, RefreshControl, ScrollView } from 'react-native';

import { useAppNavigation } from '../../navigation/hooks';
import { useWalletStore } from '../../state/walletStoreV2';
import { PriceService } from '../../services/blockchain/priceService';
import { TopBar } from '../../components/home/TopBar';
import { BalanceCard } from '../../components/home/BalanceCard';
import { ActionRow } from '../../components/home/ActionRow';
import { TokenList } from '../../components/home/TokenList';
import { TokenItem } from '../../types/wallet';

export default function DashboardScreen() {
  const navigation = useAppNavigation();
  const { activeWallet, balance, tokens, loading, refresh } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);
  const [priceData, setPriceData] = useState<{ price: number; change24h: number } | null>(null);

  useEffect(() => {
    // Initial load
    refresh();
    loadPrice();
  }, []);

  const loadPrice = async () => {
    try {
      const price = await PriceService.getPrice('GOR');
      setPriceData(price ? { price: price.price, change24h: price.change24h } : null);
    } catch (error) {
      console.error('Failed to load price:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), loadPrice()]);
    setRefreshing(false);
  };

  // Format balance for display
  const formatBalance = (bal: number | null) => {
    if (!bal) return '0.0000';
    return bal.toFixed(4);
  };

  const formatUSD = (bal: number | null) => {
    if (!bal || !priceData) return '$0.00';
    return `$${(bal * priceData.price).toFixed(2)}`;
  };

  const handleTokenPress = (token: TokenItem) => {
    navigation.navigate('TokenDetails', { token });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Fixed TopBar - 60px */}
      <TopBar
        walletName={activeWallet?.name || 'Main'}
        walletAddress={activeWallet?.publicKey || ''}
        network="GOR"
        onAccountPress={() => navigation.navigate('ManageWallets')}
        onSettingsPress={() => navigation.navigate('SettingsMain')}
      />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Fixed BalanceCard - 140px */}
        <BalanceCard
          balanceGOR={formatBalance(balance)}
          balanceUSD={formatUSD(balance)}
          change24h={priceData?.change24h}
          loading={loading && !balance}
        />

        {/* Fixed ActionRow - 90px */}
        <ActionRow
          onReceive={() => navigation.navigate('Receive')}
          onSend={() => navigation.navigate('SendSelect')}
          onSwap={() => navigation.navigate('SwapScreen')}
          onBackup={() => navigation.navigate('BackupDashboard')}
        />

        {/* Scrollable TokenList */}
        <TokenList
          tokens={tokens}
          loading={loading}
          onTokenPress={handleTokenPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}