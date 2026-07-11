import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';

export interface SettlementCardProps {
  messageCount: number;
  cost: number;
  period: string;
  status: 'pending' | 'settled' | 'failed';
}

/** Weekly settlement summary card. */
export function SettlementCard({ messageCount, cost, period, status }: SettlementCardProps) {
  const { theme: t } = useTheme();
  const statusVariant = status === 'settled' ? 'primary' : status === 'failed' ? 'danger' : 'accent';

  return (
    <View
      style={{
        backgroundColor: t.colors.card,
        borderRadius: t.radius.xl,
        padding: t.spacing[4],
        borderWidth: 1,
        borderColor: t.colors.border,
        gap: t.spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="label" color="textSoft">{period}</Text>
        <Badge variant={statusVariant} label={status} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="body">{messageCount} messages</Text>
        <Text variant="body" weight="semibold">{cost.toFixed(4)} €</Text>
      </View>
    </View>
  );
}
