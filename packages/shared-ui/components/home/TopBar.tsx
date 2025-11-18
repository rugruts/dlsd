/**
 * TopBar Component - Phantom-grade compact header
 * Platform-agnostic: Works for both React Native (mobile) and React (extension)
 * Height: 60px fixed
 */

import React from 'react';
import { truncatePublicKey } from '@dumpsack/shared-types';

export interface TopBarProps {
  walletName: string;
  walletAddress: string;
  network: string;
  onAccountPress: () => void;
  onSettingsPress: () => void;
}

export interface TopBarRenderProps extends TopBarProps {
  // Platform-specific render props
  containerStyle?: any;
  logoStyle?: any;
  accountButtonStyle?: any;
  networkBadgeStyle?: any;
  settingsButtonStyle?: any;
}

/**
 * Platform-agnostic TopBar logic
 * Returns data and handlers for platform-specific rendering
 */
export function useTopBar(props: TopBarProps) {
  const { walletName, walletAddress, network, onAccountPress, onSettingsPress } = props;

  return {
    logo: {
      text: 'DS',
      label: 'DumpSack',
    },
    account: {
      name: walletName,
      address: truncatePublicKey(walletAddress),
      onPress: onAccountPress,
    },
    network: {
      label: network,
      color: 'success',
    },
    settings: {
      icon: '⚙️',
      onPress: onSettingsPress,
    },
  };
}

// Export type for platform implementations
export type TopBarData = ReturnType<typeof useTopBar>;

