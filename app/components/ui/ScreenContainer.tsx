import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function ScreenContainer({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh
}: ScreenContainerProps) {
  if (scrollable) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <View className="p-4">
          {children}
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      {children}
    </View>
  );
}