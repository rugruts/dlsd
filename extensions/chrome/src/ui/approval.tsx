import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../main.css';

interface ApprovalRequest {
  origin: string;
  type: string;
  payload?: any;
}

function ApprovalApp() {
  const [request, setRequest] = useState<ApprovalRequest | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams.get('origin') || 'Unknown';
    const type = urlParams.get('type') || 'UNKNOWN';
    const payloadStr = urlParams.get('payload');
    
    let payload = null;
    if (payloadStr) {
      try {
        payload = JSON.parse(payloadStr);
      } catch (error) {
        console.error('Failed to parse payload:', error);
      }
    }

    setRequest({ origin, type, payload });
  }, []);

  const handleApprove = () => {
    chrome.runtime.sendMessage({
      type: 'APPROVAL_RESPONSE',
      origin: request?.origin,
      approved: true,
    });
    window.close();
  };

  const handleReject = () => {
    chrome.runtime.sendMessage({
      type: 'APPROVAL_RESPONSE',
      origin: request?.origin,
      approved: false,
    });
    window.close();
  };

  const formatRequestType = (type: string) => {
    switch (type) {
      case 'CONNECT':
        return 'Connect Wallet';
      case 'SIGN_MESSAGE':
        return 'Sign Message';
      case 'SIGN_TRANSACTION':
        return 'Sign Transaction';
      case 'SIGN_ALL_TRANSACTIONS':
        return 'Sign Multiple Transactions';
      case 'REQUEST_ACCOUNTS':
        return 'Request Accounts';
      default:
        return type;
    }
  };

  const isSensitiveOperation = (type: string) => {
    return ['SIGN_MESSAGE', 'SIGN_TRANSACTION', 'SIGN_ALL_TRANSACTIONS'].includes(type);
  };

  if (!request) {
    return (
      <div className="w-full h-screen bg-[#0b0e11] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[600px] bg-[#0b0e11] text-white p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🎒</div>
        <h1 className="text-xl font-bold mb-2">DumpSack Wallet</h1>
        <div className="text-sm opacity-60">Approval Request</div>
      </div>

      {/* Request Details */}
      <div className="flex-1 space-y-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs opacity-70 mb-1">From</div>
          <div className="font-medium break-all">{request.origin}</div>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs opacity-70 mb-1">Request Type</div>
          <div className="font-medium">{formatRequestType(request.type)}</div>
        </div>

        {isSensitiveOperation(request.type) && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-sm font-medium text-yellow-400 mb-2">⚠️ Warning</div>
            <div className="text-xs opacity-80">
              This site is requesting to sign a transaction or message. Only approve if you trust this site.
            </div>
          </div>
        )}

        {request.payload && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs opacity-70 mb-2">Transaction Data</div>
            <pre className="text-xs font-mono overflow-auto max-h-32 opacity-80">
              {JSON.stringify(request.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={handleReject}
          className="px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors font-medium text-red-400"
        >
          ✕ Reject
        </button>
        <button
          onClick={handleApprove}
          className="px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 transition-colors font-medium"
        >
          ✓ Approve
        </button>
      </div>
    </div>
  );
}

// Mount the app
const root = createRoot(document.getElementById('approval-root')!);
root.render(
  <React.StrictMode>
    <ApprovalApp />
  </React.StrictMode>
);

