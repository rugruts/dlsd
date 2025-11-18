/**
 * DSTabBar - Bottom Navigation Bar
 * Spec: Section 3.5
 * Tabs: Home, Tokens, NFTs, Settings
 */

import React from 'react';
import { DumpSackTheme } from '../theme';

export type TabKey = 'home' | 'tokens' | 'nfts' | 'settings' | string;

export interface TabItem {
  key: TabKey;
  label: string;
  icon?: React.ReactNode;
}

export interface DSTabBarProps {
  items: TabItem[];
  activeKey: TabKey;
  onTabPress: (key: TabKey) => void;
}

export const DSTabBar: React.FC<DSTabBarProps> = ({ items, activeKey, onTabPress }) => {
  return (
    <nav
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: DumpSackTheme.colors.backgroundElevated,
        borderTop: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
      }}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            onClick={() => onTabPress(item.key)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: DumpSackTheme.spacing.xs,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? DumpSackTheme.colors.orange : DumpSackTheme.colors.textSecondary,
            }}
          >
            <div style={{ fontSize: 20 }}>{item.icon ?? '•'}</div>
            <span
              style={{
                fontSize: DumpSackTheme.typography.micro.fontSize,
                fontWeight: isActive
                  ? DumpSackTheme.typography.micro.fontWeight
                  : DumpSackTheme.typography.small.fontWeight,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

