import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export interface StakeIndicatorProps {
  amount: number;
  status?: 'pending' | 'accepted' | 'rejected';
}

/** Yellow "0,50€ en jeu" stake indicator. */
export function StakeIndicator({ amount, status = 'pending' }: StakeIndicatorProps) {
  const { theme: t } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: t.colors.accentLight,
        borderRadius: t.radius.full,
        paddingHorizontal: t.spacing[3],
        paddingVertical: t.spacing[1],
        gap: t.spacing[1],
      }}
      accessibilityLabel={`${amount.toFixed(2)}€ en jeu`}
    >
      <Text style={{ fontSize: t.typography.fontSize.sm }}>💰</Text>
      <Text variant="caption" weight="semibold" style={{ color: t.colors.accent }}>
        {amount.toFixed(2)}€ en jeu
      </Text>
    </View>
  );
}
