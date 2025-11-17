/**
 * DumpSack Wallet - Navigation Component
 * Main navigation with DumpSack theme and SVG icons (no emojis)
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DumpSackTheme } from '@dumpsack/shared-ui';
import { LOGO_PATH } from '../../utils/tokenIcons';

interface NavProps {
  isFullView: boolean;
}

// SVG icon components
const icons = {
  home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  tokens: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  nfts: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
  swap: <><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>,
  staking: <><line x1="12" y1="1" x2="12" y2="23" /><polyline points="17 5 12 1 7 5" /><polyline points="7 19 12 23 17 19" /></>,
  send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
  receive: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
  backup: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
  panic: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" /></>,
};

const navItems = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/tokens', label: 'Tokens', icon: 'tokens' },
  { to: '/nfts', label: 'NFTs', icon: 'nfts' },
  { to: '/swap', label: 'Swap', icon: 'swap' },
  { to: '/staking', label: 'Stake', icon: 'staking' },
  { to: '/send', label: 'Send', icon: 'send' },
  { to: '/receive', label: 'Receive', icon: 'receive' },
  { to: '/backup', label: 'Backup', icon: 'backup' },
  { to: '/panic', label: 'Panic', icon: 'panic' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
] as const;

export function Nav({ isFullView }: NavProps) {
  const { pathname } = useLocation();

  const openInTab = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html#/dashboard') });
    }
  };

  return (
    <nav style={{
      borderBottom: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
      backgroundColor: DumpSackTheme.colors.background,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: DumpSackTheme.spacing.md,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: DumpSackTheme.spacing.sm }}>
          <img
            src={LOGO_PATH}
            alt="DumpSack"
            style={{
              width: 32,
              height: 32,
              objectFit: 'contain',
            }}
          />
          <div style={{
            fontSize: DumpSackTheme.typography.fontSize.base,
            fontWeight: DumpSackTheme.typography.fontWeight.bold,
            color: DumpSackTheme.colors.text,
          }}>
            DumpSack
          </div>
        </div>
        {!isFullView && (
          <button
            onClick={openInTab}
            style={{
              padding: `${DumpSackTheme.spacing.xs}px ${DumpSackTheme.spacing.sm}px`,
              fontSize: DumpSackTheme.typography.fontSize.xs,
              borderRadius: DumpSackTheme.borderRadius.sm,
              backgroundColor: DumpSackTheme.colors.surface,
              border: 'none',
              color: DumpSackTheme.colors.textSecondary,
              cursor: 'pointer',
            }}
            title="Open in full tab"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: isFullView ? 'wrap' : 'nowrap',
        gap: DumpSackTheme.spacing.xs,
        padding: `0 ${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.sm}px`,
        overflowX: isFullView ? 'visible' : 'auto',
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: DumpSackTheme.spacing.xs,
                padding: `${DumpSackTheme.spacing.xs}px ${DumpSackTheme.spacing.md}px`,
                borderRadius: DumpSackTheme.borderRadius.sm,
                fontSize: DumpSackTheme.typography.fontSize.sm,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                backgroundColor: isActive ? DumpSackTheme.colors.eyebrowOrange : 'transparent',
                color: isActive ? DumpSackTheme.colors.boneWhite : DumpSackTheme.colors.textSecondary,
                border: isActive ? 'none' : `${DumpSackTheme.borderWidth.thin}px solid ${DumpSackTheme.colors.border}`,
                transition: 'all 0.2s ease',
              }}
              className={isActive ? '' : 'ds-nav-item'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {icons[item.icon as keyof typeof icons]}
              </svg>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

