import { useState } from 'react';

export function useQRScanner() {
  const [scanning, setScanning] = useState(false);

  const startScan = (): Promise<string> => {
    return new Promise((resolve) => {
      setScanning(true);
      // TODO: Implement actual camera QR scanning
      // For now, simulate a delay and return a mock address
      setTimeout(() => {
        setScanning(false);
        resolve('MockScannedAddress123456789'); // Replace with actual scanned data
      }, 2000);
    });
  };

  const stopScan = () => {
    setScanning(false);
  };

  return {
    scanning,
    startScan,
    stopScan,
  };
}