/**
 * AboutSettings Component (Extension)
 * App info, version, links
 */

import React from 'react';

export function AboutSettings() {
  const appVersion = '1.0.0'; // TODO: Read from manifest.json

  const handleOpenLink = (url: string) => {
    chrome.tabs.create({ url });
  };

  return (
    <div className="space-y-6">
      {/* Logo and App Info */}
      <div className="flex flex-col items-center">
        <img
          src="/assets/logo.png"
          alt="DumpSack Logo"
          className="w-24 h-24 rounded-2xl mb-4"
        />
        <h2 className="text-[#F4F3E9] text-2xl font-bold">DumpSack</h2>
        <p className="text-[#C6D0C3] text-sm mt-1">Gorbagana Native Wallet</p>
        <p className="text-[#C6D0C3] text-xs mt-2">Version {appVersion}</p>
      </div>

      {/* Links */}
      <div className="space-y-2">
        <button
          onClick={() => handleOpenLink('https://dumpsack.xyz')}
          className="w-full bg-[#123F33] hover:bg-[#1C5A49] rounded-xl p-4 border border-[#1C5A49] flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🌐</span>
            <span className="text-[#F4F3E9] text-base font-semibold">Website</span>
          </div>
          <svg className="w-5 h-5 text-[#C6D0C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => handleOpenLink('https://support.dumpsack.xyz')}
          className="w-full bg-[#123F33] hover:bg-[#1C5A49] rounded-xl p-4 border border-[#1C5A49] flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💬</span>
            <span className="text-[#F4F3E9] text-base font-semibold">Support</span>
          </div>
          <svg className="w-5 h-5 text-[#C6D0C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => handleOpenLink('https://dumpsack.xyz/terms')}
          className="w-full bg-[#123F33] hover:bg-[#1C5A49] rounded-xl p-4 border border-[#1C5A49] flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📄</span>
            <span className="text-[#F4F3E9] text-base font-semibold">Terms of Service</span>
          </div>
          <svg className="w-5 h-5 text-[#C6D0C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => handleOpenLink('https://dumpsack.xyz/privacy')}
          className="w-full bg-[#123F33] hover:bg-[#1C5A49] rounded-xl p-4 border border-[#1C5A49] flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔒</span>
            <span className="text-[#F4F3E9] text-base font-semibold">Privacy Policy</span>
          </div>
          <svg className="w-5 h-5 text-[#C6D0C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Environment Info */}
      <div className="bg-[#123F33] p-4 rounded-xl border border-[#1C5A49]">
        <p className="text-[#C6D0C3] text-xs mb-2">Environment</p>
        <p className="text-[#F4F3E9] text-sm font-mono">
          Network: Gorbagana
        </p>
        <p className="text-[#F4F3E9] text-sm font-mono mt-1">
          Build: Production
        </p>
      </div>

      {/* Copyright */}
      <p className="text-[#C6D0C3] text-xs text-center">
        © 2025 DumpSack. All rights reserved.
      </p>
    </div>
  );
}

