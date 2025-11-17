/**
 * SettingsMainScreen
 * Main settings screen with tabs: General, Networks, Security, About
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GeneralSettings } from './GeneralSettings';
import { NetworkSettings } from './NetworkSettings';
import { SecuritySettings } from './SecuritySettings';
import { AboutSettings } from './AboutSettings';

type SettingsTab = 'general' | 'networks' | 'security' | 'about';

export default function SettingsMainScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'networks', label: 'Networks' },
    { id: 'security', label: 'Security' },
    { id: 'about', label: 'About' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-accent text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-bold">Settings</Text>
        <View className="w-16" />
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-border">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 items-center ${
              activeTab === tab.id ? 'border-b-2 border-accent' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab.id ? 'text-accent' : 'text-text-secondary'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1">
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'networks' && <NetworkSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'about' && <AboutSettings />}
      </ScrollView>
    </SafeAreaView>
  );
}

