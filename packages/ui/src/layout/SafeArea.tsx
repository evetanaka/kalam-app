import React from 'react';
import { View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';

export interface SafeAreaProps {
  children: React.ReactNode;
  bg?: keyof Theme['colors'];
}

/**
 * Cross-platform SafeAreaView.
 * Uses padding on Android (StatusBar.currentHeight), edge insets concept on iOS/web.
 */
export function SafeArea({ children, bg = 'background' }: SafeAreaProps) {
  const { theme: t } = useTheme();
  const topPadding = Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.colors[bg],
        paddingTop: topPadding,
      }}
    >
      {children}
    </View>
  );
}
