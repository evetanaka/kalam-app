import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export interface SecurityBadgeProps {
  verified?: boolean;
}

/** "🔒 chiffré · clés vérifiées" security badge in JetBrains Mono. */
export function SecurityBadge({ verified = true }: SecurityBadgeProps) {
  const { theme: t } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing[1],
      }}
      accessibilityLabel={verified ? 'Encrypted and keys verified' : 'Encrypted'}
    >
      <Text
        style={{
          fontFamily: t.typography.fontFamily.mono,
          fontSize: t.typography.fontSize.xs,
          color: t.colors.textSoft,
          letterSpacing: t.typography.letterSpacing.extraWide,
        }}
      >
        🔒 chiffré{verified ? ' · clés vérifiées' : ''}
      </Text>
    </View>
  );
}
