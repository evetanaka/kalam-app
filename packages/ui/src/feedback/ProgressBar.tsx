import React from 'react';
import { View } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';

export interface ProgressBarProps {
  /** Progress value between 0 and 1 */
  value: number;
  /** Color token for the fill */
  color?: keyof Theme['colors'];
  /** Bar height in px */
  height?: number;
}

/** Horizontal progress bar. */
export function ProgressBar({ value, color = 'primary', height = 6 }: ProgressBarProps) {
  const { theme: t } = useTheme();
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: t.colors.border,
        overflow: 'hidden',
      }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View
        style={{
          height: '100%',
          width: `${clamped * 100}%`,
          backgroundColor: t.colors[color],
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}
