import React from 'react';
import { View, SafeAreaView } from 'react-native';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-4">
        {children}
      </View>
    </SafeAreaView>
  );
}