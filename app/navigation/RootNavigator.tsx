import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useWalletStore } from '../state/walletStoreV2';
import { useAuthStore } from '../state/authStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ManageWalletsScreen from '../screens/wallet/ManageWalletsScreen';
import SettingsMainScreen from '../screens/settings/SettingsMainScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const { wallets } = useWalletStore();
  const { isAuthenticated } = useAuthStore();
  const hasWallet = wallets.length > 0;

  useEffect(() => {
    // Just check if wallet exists on mount
    setIsLoading(false);
  }, []);

  // Listen for wallet changes
  useEffect(() => {
    // Wallet store will auto-hydrate from storage
    console.log('Wallets:', wallets.length, 'Authenticated:', isAuthenticated);
  }, [wallets, isAuthenticated]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0E3A2F' }}>
        <ActivityIndicator size="large" color="#F26A2E" />
      </View>
    );
  }

  // User is fully authenticated if they have completed onboarding (isAuthenticated = true)
  // AND they have a wallet in walletStoreV2
  const isFullyAuthenticated = isAuthenticated && hasWallet;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFullyAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            {/* Modal screens */}
            <Stack.Screen
              name="ManageWallets"
              component={ManageWalletsScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="SettingsMain"
              component={SettingsMainScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}