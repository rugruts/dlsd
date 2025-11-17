/**
 * GeneralSettings Component (Extension)
 * Currency, Language, Theme settings
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore, Currency, Language, Theme } from '../../stores/settingsStore';

export function GeneralSettings() {
  const { i18n } = useTranslation();
  const { currency, language, theme, setCurrency, setLanguage, setTheme } = useSettingsStore();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const currencies: Currency[] = ['USD', 'EUR', 'GBP'];
  const languages: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ];
  const themes: { value: Theme; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  return (
    <div className="space-y-6">
      {/* Currency */}
      <div>
        <label className="text-[#C6D0C3] text-sm mb-3 block">Currency</label>
        <div className="flex gap-2">
          {currencies.map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors ${
                currency === curr
                  ? 'bg-[#F26A2E] text-white'
                  : 'bg-[#123F33] text-[#C6D0C3] hover:bg-[#1C5A49] border border-[#1C5A49]'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="text-[#C6D0C3] text-sm mb-3 block">Language</label>
        <div className="flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value)}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors ${
                language === lang.value
                  ? 'bg-[#F26A2E] text-white'
                  : 'bg-[#123F33] text-[#C6D0C3] hover:bg-[#1C5A49] border border-[#1C5A49]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="text-[#C6D0C3] text-sm mb-3 block">Theme</label>
        <div className="flex gap-2">
          {themes.map((thm) => (
            <button
              key={thm.value}
              onClick={() => setTheme(thm.value)}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors ${
                theme === thm.value
                  ? 'bg-[#F26A2E] text-white'
                  : 'bg-[#123F33] text-[#C6D0C3] hover:bg-[#1C5A49] border border-[#1C5A49]'
              }`}
            >
              {thm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-[#123F33] p-4 rounded-xl border border-[#1C5A49]">
        <p className="text-[#C6D0C3] text-sm">
          Changes to currency and language will take effect immediately. Theme changes will apply
          to the extension interface.
        </p>
      </div>
    </div>
  );
}

