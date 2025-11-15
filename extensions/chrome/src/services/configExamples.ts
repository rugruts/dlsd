// Extension Integration Examples for DumpSack Config System

import { appConfig, isFeatureEnabled, configManager } from '../../../../packages/shared-utils';

// Example: Background Script Configuration
export class BackgroundConfig {
  getRpcEndpoints() {
    return {
      primary: appConfig.rpc.primary,
      fallback: appConfig.rpc.fallback,
    };
  }

  shouldEnableFeature(feature: keyof typeof appConfig.features): boolean {
    return appConfig.features[feature];
  }

  getFirebaseConfig() {
    return appConfig.firebase;
  }
}

// Example: Content Script with Feature Flags
if (isFeatureEnabled('enableRugRadar')) {
  // Inject rug radar content script
  console.log('Rug radar enabled');
}

// Example: Provider Script Configuration
export class WalletProvider {
  private rpcUrl: string;

  constructor() {
    this.rpcUrl = appConfig.rpc.primary;
  }

  async connect() {
    if (!isFeatureEnabled('enableSwaps')) {
      throw new Error('Swaps not enabled');
    }

    // Connect to wallet...
  }

  getSupportedFeatures() {
    return {
      swaps: appConfig.features.enableSwaps,
      staking: appConfig.features.enableStaking,
      throneLinks: appConfig.features.enableThroneLinks,
    };
  }
}

// Example: Popup Script Environment Detection
export function getEnvironmentInfo() {
  return {
    environment: configManager.getEnvironment(),
    isDevelopment: configManager.isDevelopment(),
    isProduction: configManager.isProduction(),
  };
}

// Example: Dynamic Feature Loading
export async function loadFeatures() {
  const features = configManager.getFeatureFlags();
  const modules = [];

  if (features.enableSwaps) {
    const { SwapModule } = await import('./swapModule');
    modules.push(new SwapModule());
  }

  if (features.enableStaking) {
    const { StakingModule } = await import('./stakingModule');
    modules.push(new StakingModule());
  }

  if (features.enableThroneLinks) {
    const { ThroneLinksModule } = await import('./throneLinksModule');
    modules.push(new ThroneLinksModule());
  }

  return modules;
}

// Example: Extension Manifest Configuration
export function getManifestConfig() {
  const features = configManager.getFeatureFlags();

  return {
    permissions: [
      'storage',
      'activeTab',
      ...(features.enableNotifications ? ['notifications'] : []),
    ],
    content_scripts: [
      ...(features.enableRugRadar ? [{
        matches: ['*://*/*'],
        js: ['rug-radar.js'],
      }] : []),
    ],
  };
}

// Example: API Key Management
export class ApiKeyManager {
  getSwapApiKey(): string | undefined {
    return appConfig.swap.apiKey;
  }

  getOnRampProviders() {
    const providers = [];

    if (appConfig.onRamp.moonpay.enabled) {
      providers.push({
        name: 'MoonPay',
        config: {
          apiKey: appConfig.onRamp.moonpay.apiKey,
          baseUrl: appConfig.onRamp.moonpay.baseUrl,
        },
      });
    }

    if (appConfig.onRamp.ramp.enabled) {
      providers.push({
        name: 'Ramp',
        config: {
          apiKey: appConfig.onRamp.ramp.apiKey,
          baseUrl: appConfig.onRamp.ramp.baseUrl,
        },
      });
    }

    return providers;
  }
}

// Example: Backup Service Integration
import { extensionBackupIntegration } from './backupIntegration';

export async function initializeBackup(userId: string) {
  if (!isFeatureEnabled('enableBackup')) {
    console.log('Backup feature disabled');
    return;
  }

  extensionBackupIntegration.initializeForUser(userId);

  // Check for existing backup
  const hasBackup = await extensionBackupIntegration.checkForBackup();
  if (hasBackup) {
    // Attempt restoration
    await extensionBackupIntegration.promptRestoreBackup();
  }
}

// Example: Settings Page with Dynamic Options
export function getSettingsOptions() {
  const features = configManager.getFeatureFlags();

  return [
    {
      id: 'biometrics',
      enabled: features.enableBiometrics,
      label: 'Biometric Authentication',
    },
    {
      id: 'notifications',
      enabled: features.enableNotifications,
      label: 'Push Notifications',
    },
    {
      id: 'backup',
      enabled: features.enableBackup,
      label: 'Cloud Backup',
    },
    {
      id: 'swaps',
      enabled: features.enableSwaps,
      label: 'Token Swaps',
    },
    {
      id: 'staking',
      enabled: features.enableStaking,
      label: 'Staking',
    },
  ].filter(option => option.enabled);
}

// Example: Analytics Configuration
export function getAnalyticsConfig() {
  return {
    enabled: configManager.isProduction(),
    trackingId: configManager.isProduction() ? 'GA_PROD_ID' : 'GA_DEV_ID',
  };
}

// Example: Error Reporting
export function shouldReportErrors(): boolean {
  // Only report errors in production, or in development if explicitly enabled
  return configManager.isProduction() ||
         (configManager.isDevelopment() && appConfig.features.enableNotifications);
}