/**
 * BottomNav Component - Phantom-grade bottom navigation (Extension)
 * Simple bottom tab bar for main sections: Home | Tokens | NFTs | Swap
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DumpSackTheme } from '@dumpsack/shared-ui';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/tokens', label: 'Tokens', icon: '💰' },
  { to: '/nfts', label: 'NFTs', icon: '🖼️' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
] as const;

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: DumpSackTheme.colors.background,
      borderTop: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
    }}>
      {navItems.map((item) => {
        const isActive = pathname === item.to;
        return (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${DumpSackTheme.spacing.xs}px 0`,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? DumpSackTheme.colors.primary : DumpSackTheme.colors.textSecondary,
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>{item.icon}</span>
            <span style={{
              fontSize: DumpSackTheme.typography.fontSize.xs,
              fontWeight: isActive ? DumpSackTheme.typography.fontWeight.semibold : DumpSackTheme.typography.fontWeight.normal,
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

