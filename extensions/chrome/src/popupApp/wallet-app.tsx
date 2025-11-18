import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getSupabase } from '../../../../packages/shared-utils/supabase';
import { appConfig } from '../../../../packages/shared-utils';
import { useWalletStore } from './stores/walletStoreV2';

import { Dashboard } from './views/Dashboard';
import { Tokens } from './views/Tokens';
import { NFTs } from './views/NFTs';
import { Swap } from './views/Swap';
import { Staking } from './views/Staking';
import { Send } from './views/Send';
import { Receive } from './views/Receive';
import { Backup } from './views/Backup';
import { Panic } from './views/Panic';
import { SettingsMain } from './views/SettingsMain';
import { ManageWallets } from './views/ManageWallets';
import { Nav } from './widgets/Nav';
import { SignIn } from './views/SignIn';

export function WalletApp() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isFullView, setIsFullView] = useState(false);
  const { wallets } = useWalletStore();

  useEffect(() => {
    // Check if we're in popup or full tab view
    const isPopup = window.location.pathname.includes('popup.html');
    setIsFullView(!isPopup);

    // Check Supabase session AND wallet existence
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hasSession = !!session;
      const hasWallet = wallets.length > 0;
      setIsAuthenticated(hasSession && hasWallet);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = !!session;
      const hasWallet = wallets.length > 0;
      setIsAuthenticated(hasSession && hasWallet);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [wallets]);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="w-full h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto mb-4"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign in
  if (!isAuthenticated) {
    return (
      <div className={`${isFullView ? 'w-full h-screen' : 'w-[380px] h-[600px]'} bg-[#0f0f0f] text-white`}>
        <SignIn />
      </div>
    );
  }

  // Authenticated - show wallet
  return (
    <HashRouter>
      <div className={`${isFullView ? 'w-full min-h-screen' : 'w-[380px] h-[600px]'} bg-[#0f0f0f] text-white overflow-hidden flex flex-col`}>
        <Nav isFullView={isFullView} />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tokens" element={<Tokens />} />
            <Route path="/nfts" element={<NFTs />} />
            <Route path="/swap" element={<Swap enabled={appConfig.features.enableSwaps} />} />
            <Route path="/staking" element={<Staking enabled={appConfig.features.enableStaking} />} />
            <Route path="/send" element={<Send />} />
            <Route path="/receive" element={<Receive />} />
            <Route path="/backup" element={<Backup enabled={appConfig.features.enableBackup} />} />
            <Route path="/panic" element={<Panic />} />
            <Route path="/settings" element={<SettingsMain />} />
            <Route path="/manage-wallets" element={<ManageWallets />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

