import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';

export interface DividerProps {
  /** Color token (default: border) */
  color?: keyof Theme['colors'];
  /** Vertical margins (spacing token) */
  spacing?: keyof Theme['spacing'];
}

/** Hairline divider using border token color by default. */
export function Divider({ color = 'border', spacing }: DividerProps) {
  const { theme: t } = useTheme();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: t.colors[color],
        marginVertical: spacing != null ? t.spacing[spacing] : 0,
      }}
      accessibilityRole="none"
    />
  );
}
