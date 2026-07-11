import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export interface KalamNameProps {
  /** Username (without .kalam) */
  name: string;
  /** Font size token */
  size?: 'sm' | 'md' | 'lg';
  /** Show verified badge */
  verified?: boolean;
}

/** Styled "nom.kalam" display with optional verification badge. */
export function KalamName({ name, size = 'md', verified }: KalamNameProps) {
  const { theme: t } = useTheme();
  const fontSize = size === 'sm' ? t.typography.fontSize.sm : size === 'lg' ? t.typography.fontSize.xl : t.typography.fontSize.md;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing[1] }}>
      <Text
        style={{
          fontFamily: t.typography.fontFamily.display,
          fontSize,
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.text,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          fontFamily: t.typography.fontFamily.display,
          fontSize,
          fontWeight: t.typography.fontWeight.regular,
          color: t.colors.primary,
        }}
      >
        .kalam
      </Text>
      {verified && <Text style={{ fontSize }}>✓</Text>}
    </View>
  );
}
