/**
 * SettingsMain View (Extension)
 * Main settings screen with tabs
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneralSettings } from '../components/settings/GeneralSettings';
import { NetworkSettings } from '../components/settings/NetworkSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { AboutSettings } from '../components/settings/AboutSettings';

type SettingsTab = 'general' | 'networks' | 'security' | 'about';

export function SettingsMain() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'networks', label: 'Networks' },
    { id: 'security', label: 'Security' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-[#0E3A2F] text-[#F4F3E9]">
      {/* Header */}
      <div className="bg-[#123F33] border-b border-[#1C5A49] px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-[#C6D0C3] hover:text-[#F4F3E9] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#123F33] border-b border-[#1C5A49] px-4">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[#F26A2E]'
                  : 'text-[#C6D0C3] hover:text-[#F4F3E9]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F26A2E]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'networks' && <NetworkSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'about' && <AboutSettings />}
      </div>
    </div>
  );
}

