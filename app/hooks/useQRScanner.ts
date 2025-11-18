import { useState, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';

export interface QRScannerResult {
  data: string;
  type: string;
}

export function useQRScanner() {
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);

  const startScan = async (): Promise<string> => {
    // Request camera permission if not granted
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        throw new Error('Camera permission denied');
      }
    }

    setScanning(true);
    setScannedData(null);

    // Return a promise that resolves when QR code is scanned
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        setScanning(false);
        reject(new Error('QR scan timeout'));
      }, 60000); // 60 second timeout

      // Store resolve/reject in state for handleBarCodeScanned to use
      (window as any).__qrScanResolve = (data: string) => {
        clearTimeout(timeout);
        setScanning(false);
        resolve(data);
      };
      (window as any).__qrScanReject = (error: Error) => {
        clearTimeout(timeout);
        setScanning(false);
        reject(error);
      };
    });
  };

  const stopScan = () => {
    setScanning(false);
    if ((window as any).__qrScanReject) {
      (window as any).__qrScanReject(new Error('Scan cancelled'));
      delete (window as any).__qrScanResolve;
      delete (window as any).__qrScanReject;
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanning) return;

    setScannedData(data);
    if ((window as any).__qrScanResolve) {
      (window as any).__qrScanResolve(data);
      delete (window as any).__qrScanResolve;
      delete (window as any).__qrScanReject;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ((window as any).__qrScanReject) {
        (window as any).__qrScanReject(new Error('Component unmounted'));
        delete (window as any).__qrScanResolve;
        delete (window as any).__qrScanReject;
      }
    };
  }, []);

  return {
    scanning,
    permission,
    scannedData,
    startScan,
    stopScan,
    handleBarCodeScanned,
    CameraView, // Export CameraView for use in components
  };
}