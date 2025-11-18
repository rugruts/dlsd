/**
 * BottomNav Component - Phantom-grade bottom navigation (Extension)
 * Simple bottom tab bar for main sections: Home | Tokens | NFTs | Swap
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DSTabBar, type TabItem, DSIcon } from '@dumpsack/shared-ui';

const navItems: TabItem[] = [
  { key: '/dashboard', label: 'Home', icon: <DSIcon name="wallet" size={18} /> },
  { key: '/tokens', label: 'Tokens', icon: <DSIcon name="tokens" size={18} /> },
  { key: '/nfts', label: 'NFTs', icon: <DSIcon name="nft" size={18} /> },
  { key: '/settings', label: 'Settings', icon: <DSIcon name="settings" size={18} /> },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeKey = navItems.find((item) => pathname.startsWith(item.key))?.key ?? '/dashboard';

  return (
    <DSTabBar
      items={navItems}
      activeKey={activeKey}
      onTabPress={(key) => navigate(String(key))}
    />
  );
}

