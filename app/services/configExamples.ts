// Mobile Integration Examples for DumpSack Config System

import { appConfig, isFeatureEnabled, configManager } from '../../packages/shared-utils';

// Example: Blockchain RPC Client Integration
import { createRpcClient } from './blockchain/rpcClient';

const rpcClient = createRpcClient({
  primaryRpc: appConfig.rpc.primary,
  fallbackRpc: appConfig.rpc.fallback,
  commitment: appConfig.rpc.commitment,
  timeoutMs: appConfig.rpc.timeoutMs,
  maxRetries: appConfig.rpc.maxRetries,
});

// Example: Swap Service Integration
class SwapService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = appConfig.swap.aggregatorUrl;
    this.apiKey = appConfig.swap.apiKey;
  }

  async getQuote(inputMint: string, outputMint: string, amount: string) {
    if (!isFeatureEnabled('enableSwaps')) {
      throw new Error('Swaps are not enabled');
    }

    const response = await fetch(`${this.baseUrl}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
      body: JSON.stringify({
        inputMint,
        outputMint,
        amount,
        // ... other params
      }),
    });

    return response.json();
  }
}

// Example: Feature-Gated UI Components
import React from 'react';
import { View, Text } from 'react-native';
import { isFeatureEnabled } from '../../packages/shared-utils';

export function ThroneLinksSection() {
  if (!isFeatureEnabled('enableThroneLinks')) {
    return null;
  }

  return (
    <View>
      <Text>Throne Links</Text>
      {/* Throne links UI */}
    </View>
  );
}

// Example: On-Ramp Provider Integration
class OnRampService {
  async getSupportedCurrencies() {
    const providers = [];

    if (appConfig.onRamp.moonpay.enabled) {
      providers.push({
        name: 'MoonPay',
        apiKey: appConfig.onRamp.moonpay.apiKey,
        baseUrl: appConfig.onRamp.moonpay.baseUrl,
      });
    }

    if (appConfig.onRamp.ramp.enabled) {
      providers.push({
        name: 'Ramp',
        apiKey: appConfig.onRamp.ramp.apiKey,
        baseUrl: appConfig.onRamp.ramp.baseUrl,
      });
    }

    if (appConfig.onRamp.transak.enabled) {
      providers.push({
        name: 'Transak',
        apiKey: appConfig.onRamp.transak.apiKey,
        baseUrl: appConfig.onRamp.transak.baseUrl,
      });
    }

    return providers;
  }
}

// Example: Environment-Specific Behavior
export function getApiEndpoint() {
  const env = configManager.getEnvironment();

  switch (env) {
    case 'development':
      return 'https://dev-api.dumpsack.com';
    case 'staging':
      return 'https://staging-api.dumpsack.com';
    case 'production':
      return 'https://api.dumpsack.com';
    default:
      return 'https://api.dumpsack.com';
  }
}

// Example: Firebase Config Usage
import { firebaseConfig } from '../../packages/shared-utils';

export async function initializeFirebase() {
  await firebaseConfig.initializeFirebase();
  const db = await firebaseConfig.getFirestore();
  const auth = await firebaseConfig.getAuth();

  // Use db and auth...
}

// Example: Backup Service with Feature Flag
import { backupIntegration } from './backup/backupIntegration';

export async function handleWalletBackup(keyMaterial: any) {
  if (!isFeatureEnabled('enableBackup')) {
    console.log('Backup feature is disabled');
    return;
  }

  await backupIntegration.promptEnableBackup(keyMaterial);
}

// Example: Settings Screen with Dynamic Features
export function SettingsScreen() {
  const features = configManager.getFeatureFlags();

  return (
    <View>
      {features.enableBiometrics && (
        <Text>Biometric Settings</Text>
      )}

      {features.enableNotifications && (
        <Text>Notification Settings</Text>
      )}

      {features.enableBackup && (
        <Text>Backup Settings</Text>
      )}
    </View>
  );
}