/**
 * SecuritySettings Component (Extension)
 * Security toggles and Panic Bunker
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

export function SecuritySettings() {
  const navigate = useNavigate();

  // Note: Extension doesn't have biometrics, but we can add other security features
  const handleOpenPanicBunker = () => {
    navigate('/panic');
  };

  return (
    <div className="space-y-3">
      {/* Panic Bunker */}
      <button
        onClick={handleOpenPanicBunker}
        className="w-full bg-[#123F33] hover:bg-[#1C5A49] rounded-xl p-4 border border-[#1C5A49] transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">⚠️</span>
              <h4 className="text-[#F4F3E9] text-base font-semibold">
                Panic Bunker
              </h4>
            </div>
            <p className="text-[#C6D0C3] text-sm">
              Emergency wallet protection and recovery
            </p>
          </div>
          <svg className="w-5 h-5 text-[#C6D0C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Info */}
      <div className="bg-[#123F33] p-4 rounded-xl border border-[#1C5A49]">
        <p className="text-[#C6D0C3] text-sm">
          Security settings help protect your wallet from unauthorized access. Use Panic Bunker
          for emergency wallet protection and recovery.
        </p>
      </div>
    </div>
  );
}

