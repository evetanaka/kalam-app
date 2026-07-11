import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

const SIZES = { sm: 28, md: 40, lg: 64 } as const;

export interface LogoProps {
  size?: keyof typeof SIZES;
}

/**
 * Kalam logo component.
 * Renders a branded placeholder — replace with actual logo image asset.
 */
export function Logo({ size = 'md' }: LogoProps) {
  const { theme: t } = useTheme();
  const px = SIZES[size];

  return (
    <View
      style={{
        width: px,
        height: px,
        borderRadius: t.radius.lg,
        backgroundColor: t.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityRole="image"
      accessibilityLabel="Kalam logo"
    >
      <Text
        style={{
          color: t.colors.textOnPrimary,
          fontSize: px * 0.45,
          fontFamily: t.typography.fontFamily.display,
          fontWeight: t.typography.fontWeight.extrabold,
        }}
      >
        K
      </Text>
    </View>
  );
}
