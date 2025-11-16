import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { createRpcClient } from '../services/blockchain/rpcClient';

const rpcClient = createRpcClient();

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [rpcHealthy, setRpcHealthy] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isConnected) {
      checkRpcHealth();
      // Check RPC health every 30 seconds
      const interval = setInterval(checkRpcHealth, 30000);
      return () => clearInterval(interval);
    } else {
      setRpcHealthy(false);
    }
  }, [isConnected]);

  const checkRpcHealth = async () => {
    if (!isConnected) return;

    setIsChecking(true);
    try {
      const health = await rpcClient.getHealth();
      setRpcHealthy(health.status === 'ok');
    } catch (error) {
      setRpcHealthy(false);
    } finally {
      setIsChecking(false);
    }
  };

  const isOnline = isConnected && rpcHealthy;

  return {
    isConnected,
    rpcHealthy,
    isOnline,
    isChecking,
    checkRpcHealth,
  };
}