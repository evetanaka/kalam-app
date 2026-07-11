import React from 'react';
import { View } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';
import { Text } from './Text';

export interface BadgeProps {
  /** Badge variant */
  variant?: 'primary' | 'accent' | 'danger' | 'subtle';
  /** Text label */
  label?: string;
  /** Numeric count (overrides label) */
  count?: number;
}

const variantColors = (t: Theme) => ({
  primary: { bg: t.colors.primary, text: t.colors.textOnPrimary },
  accent: { bg: t.colors.accent, text: t.colors.text },
  danger: { bg: t.colors.danger, text: t.colors.textOnPrimary },
  subtle: { bg: t.colors.pale, text: t.colors.primary },
});

/** Pill-shaped badge for counts or labels. */
export function Badge({ variant = 'primary', label, count }: BadgeProps) {
  const { theme: t } = useTheme();
  const colors = variantColors(t)[variant];
  const display = count != null ? (count > 99 ? '99+' : String(count)) : label;

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        borderRadius: t.radius.full,
        paddingHorizontal: t.spacing[2],
        paddingVertical: t.spacing[1] / 2,
        minWidth: 20,
        alignItems: 'center',
      }}
      accessibilityRole="text"
      accessibilityLabel={`Badge: ${display}`}
    >
      <Text style={{ color: colors.text, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold }}>
        {display}
      </Text>
    </View>
  );
}
