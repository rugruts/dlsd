/**
 * GeneralSettings Component
 * Currency, Language, Theme settings
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSettingsStore, Currency, Language, Theme } from '../../state/settingsStore';
import { useTranslation } from 'react-i18next';

export function GeneralSettings() {
  const { i18n } = useTranslation();
  const { currency, language, theme, setCurrency, setLanguage, setTheme } = useSettingsStore();

  const currencies: Currency[] = ['USD', 'EUR', 'GBP'];
  const languages: Language[] = ['en', 'es'];
  const themes: Theme[] = ['system', 'light', 'dark'];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const themeLabels: Record<Theme, string> = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  };

  const languageLabels: Record<Language, string> = {
    en: 'English',
    es: 'Español',
  };

  return (
    <View className="p-4">
      {/* Currency */}
      <View className="mb-6">
        <Text className="text-text-primary text-base font-semibold mb-3">Currency</Text>
        <View className="flex-row space-x-2">
          {currencies.map((curr) => (
            <TouchableOpacity
              key={curr}
              onPress={() => setCurrency(curr)}
              className={`flex-1 py-3 rounded-xl items-center ${
                currency === curr
                  ? 'bg-accent'
                  : 'bg-card border border-border'
              }`}
            >
              <Text
                className={`font-semibold ${
                  currency === curr ? 'text-white' : 'text-text-primary'
                }`}
              >
                {curr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Language */}
      <View className="mb-6">
        <Text className="text-text-primary text-base font-semibold mb-3">Language</Text>
        <View className="flex-row space-x-2">
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => handleLanguageChange(lang)}
              className={`flex-1 py-3 rounded-xl items-center ${
                language === lang
                  ? 'bg-accent'
                  : 'bg-card border border-border'
              }`}
            >
              <Text
                className={`font-semibold ${
                  language === lang ? 'text-white' : 'text-text-primary'
                }`}
              >
                {languageLabels[lang]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Theme */}
      <View className="mb-6">
        <Text className="text-text-primary text-base font-semibold mb-3">Theme</Text>
        <View className="flex-row space-x-2">
          {themes.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTheme(t)}
              className={`flex-1 py-3 rounded-xl items-center ${
                theme === t
                  ? 'bg-accent'
                  : 'bg-card border border-border'
              }`}
            >
              <Text
                className={`font-semibold ${
                  theme === t ? 'text-white' : 'text-text-primary'
                }`}
              >
                {themeLabels[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Info */}
      <View className="bg-card p-4 rounded-xl border border-border">
        <Text className="text-text-secondary text-sm">
          Changes to currency and language will be reflected across the app. Theme changes may
          require restarting the app.
        </Text>
      </View>
    </View>
  );
}

