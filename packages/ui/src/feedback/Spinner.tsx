import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';

export interface SpinnerProps {
  size?: 'small' | 'large';
  color?: keyof Theme['colors'];
}

/** Loading spinner using the primary green by default. */
export function Spinner({ size = 'small', color = 'primary' }: SpinnerProps) {
  const { theme: t } = useTheme();
  return (
    <ActivityIndicator
      size={size}
      color={t.colors[color]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    />
  );
}
