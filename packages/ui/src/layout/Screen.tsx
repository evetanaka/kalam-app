import React from 'react';
import { View, ScrollView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';
import { SafeArea } from './SafeArea';

export interface ScreenProps {
  children: React.ReactNode;
  /** Wrap content in ScrollView */
  scroll?: boolean;
  /** Add horizontal padding */
  padded?: boolean;
  /** Background color token */
  bg?: keyof Theme['colors'];
}

/** Full-screen container with SafeArea, StatusBar, and KeyboardAvoidingView. */
export function Screen({ children, scroll, padded, bg = 'background' }: ScreenProps) {
  const { theme: t } = useTheme();
  const paddingH = padded ? t.spacing[4] : 0;

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: paddingH }}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, paddingHorizontal: paddingH }}>{children}</View>
  );

  return (
    <SafeArea bg={bg}>
      <StatusBar barStyle={t.dark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeArea>
  );
}
