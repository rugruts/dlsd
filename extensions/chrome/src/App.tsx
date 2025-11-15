import React, { useState, useEffect } from 'react';
import { ConnectedSite } from '../../../packages/shared-types';

function App() {
  const [activeTab, setActiveTab] = useState<'account' | 'sites' | 'settings'>('account');
  const [connectedSites, setConnectedSites] = useState<ConnectedSite[]>([]);
  const [publicKey, setPublicKey] = useState<string>('');
  const [balance, setBalance] = useState<string>('0.00');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get data from background service
      const backgroundService = (globalThis as any).backgroundService;
      if (backgroundService) {
        const sites = backgroundService.getConnectedSites();
        const key = backgroundService.getMockPublicKey();
        setConnectedSites(sites);
        setPublicKey(key);
        setBalance('1.23'); // Mock balance
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleDisconnectSite = async (origin: string) => {
    try {
      const backgroundService = (globalThis as any).backgroundService;
      if (backgroundService) {
        await backgroundService.disconnectSite(origin);
        await loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to disconnect site:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatOrigin = (origin: string) => {
    return origin.replace(/^https?:\/\//, '');
  };

  return (
    <div className="w-80 h-96 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold text-center">DumpSack Wallet</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-2 px-4 text-sm ${
            activeTab === 'account' ? 'bg-gray-700 border-b-2 border-blue-500' : 'hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm ${
            activeTab === 'sites' ? 'bg-gray-700 border-b-2 border-blue-500' : 'hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab('sites')}
        >
          Sites
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm ${
            activeTab === 'settings' ? 'bg-gray-700 border-b-2 border-blue-500' : 'hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Address</div>
              <div className="font-mono text-sm break-all">{formatAddress(publicKey)}</div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Balance</div>
              <div className="text-2xl font-bold">{balance} GOR</div>
            </div>

            <div className="text-center text-sm text-gray-400">
              Connected to {connectedSites.length} site{connectedSites.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {activeTab === 'sites' && (
          <div className="space-y-3">
            {connectedSites.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No connected sites
              </div>
            ) : (
              connectedSites.map((site) => (
                <div key={site.origin} className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{formatOrigin(site.origin)}</div>
                      <div className="text-xs text-gray-400">
                        Connected {new Date(site.connectedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnectSite(site.origin)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Disconnect
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    Permissions: {site.permissions.join(', ')}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Sync with Mobile</h3>
              <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded text-sm">
                Sync Now
              </button>
              <div className="text-xs text-gray-400 mt-2">
                Last synced: Never
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Security</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Biometrics enabled</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex justify-between">
                  <span>Ledger connected</span>
                  <span className="text-gray-400">✗</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-red-600 hover:bg-red-700 py-2 px-4 rounded text-sm">
              Lock Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;