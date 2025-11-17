/**
 * App Header Component (Extension)
 * Header with wallet chip and settings button
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { DumpSackTheme } from '@dumpsack/shared-ui';
import { WalletChip } from './WalletChip';
import { WalletSwitcherModal } from './WalletSwitcherModal';

export function AppHeader() {
  const navigate = useNavigate();
  const [showWalletSwitcher, setShowWalletSwitcher] = useState(false);

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
        backgroundColor: DumpSackTheme.colors.background,
        borderBottom: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
      }}>
        {/* Wallet Chip */}
        <WalletChip onClick={() => setShowWalletSwitcher(true)} />

        {/* Settings Button */}
        <button
          onClick={() => navigate('/settings-main')}
          style={{
            padding: DumpSackTheme.spacing.sm,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: DumpSackTheme.borderRadius.sm,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = DumpSackTheme.colors.surface;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Settings size={20} color={DumpSackTheme.colors.textSecondary} />
        </button>
      </div>

      {/* Wallet Switcher Modal */}
      {showWalletSwitcher && (
        <WalletSwitcherModal
          visible={showWalletSwitcher}
          onClose={() => setShowWalletSwitcher(false)}
          onManageWallets={() => {
            setShowWalletSwitcher(false);
            navigate('/manage-wallets');
          }}
        />
      )}
    </>
  );
}

