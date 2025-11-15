import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { useBalance } from '../hooks/useBalance';
import { PriceService } from '../services/blockchain/priceService';
import { openFaucet } from '../services/blockchain/faucet';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/Button';

export default function DashboardScreen() {
  const { publicKey } = useWallet();
  const { balance, loading: balanceLoading, error: balanceError, refresh: refreshBalance } = useBalance(publicKey);
  const [priceData, setPriceData] = useState<{ price: number; change24h: number } | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    loadPrice();
  }, []);

  const loadPrice = async () => {
    setPriceLoading(true);
    try {
      const price = await PriceService.getPrice('GOR');
      setPriceData(price ? { price: price.price, change24h: price.change24h } : null);
    } catch (error) {
      console.error('Failed to load price:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleFaucetRaid = async () => {
    try {
      await openFaucet();
    } catch (error) {
      Alert.alert('Error', 'Could not open faucet');
    }
  };

  const formatBalance = (bal: bigint | null) => {
    if (!bal) return '0.00';
    return (Number(bal) / 1e9).toFixed(4); // Assuming 9 decimals for GOR
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <ScreenContainer refreshing={balanceLoading} onRefresh={refreshBalance}>
      <View className="items-center mb-8">
        <Text className="text-text text-4xl font-bold mb-2">
          {balanceLoading ? '...' : formatBalance(balance)} GOR
        </Text>
        {priceData && (
          <Text className="text-textSecondary text-lg">
            {priceLoading ? '...' : formatPrice(priceData.price)}
            <Text className={priceData.change24h >= 0 ? 'text-success' : 'text-error'}>
              {' '}({priceData.change24h >= 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%)
            </Text>
          </Text>
        )}
      </View>

      <Card className="mb-6">
        <Text className="text-text text-center text-lg mb-4">Quick Actions</Text>
        <Button title="Faucet Raid" onPress={handleFaucetRaid} variant="primary" />
      </Card>

      {balanceError && (
        <Text className="text-error text-center mt-4">{balanceError}</Text>
      )}
    </ScreenContainer>
  );
}