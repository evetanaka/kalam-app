import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export interface DepositGaugeProps {
  /** Total deposit amount */
  total: number;
  /** Guarantee floor amount */
  floor: number;
  /** Current balance */
  current: number;
  /** Currency symbol */
  currency?: string;
}

/**
 * Deposit gauge bar (10px height) with two segments:
 * - Green (80%): guarantee floor
 * - Yellow: reserve above floor
 * Includes human-readable translation (e.g. "≈ 29 ans de messages")
 */
export function DepositGauge({ total, floor, current, currency = '€' }: DepositGaugeProps) {
  const { theme: t } = useTheme();
  const floorPercent = total > 0 ? (floor / total) * 100 : 80;
  const reservePercent = total > 0 ? Math.max(0, ((current - floor) / total) * 100) : 0;

  // Rough estimate: ~0.003€ per message, 50 messages/day
  const costPerDay = 0.003 * 50;
  const daysLeft = costPerDay > 0 ? Math.floor(current / costPerDay) : 0;
  const yearsLeft = Math.floor(daysLeft / 365);
  const humanLabel = yearsLeft > 0 ? `≈ ${yearsLeft} ans de messages` : `≈ ${daysLeft} jours de messages`;

  return (
    <View style={{ gap: t.spacing[2] }}>
      <View
        style={{
          height: 10,
          borderRadius: 5,
          backgroundColor: t.colors.border,
          flexDirection: 'row',
          overflow: 'hidden',
        }}
        accessibilityRole="progressbar"
        accessibilityLabel={`Deposit gauge: ${current}${currency} of ${total}${currency}`}
      >
        <View style={{ width: `${floorPercent}%`, backgroundColor: t.colors.primary, borderRadius: 5 }} />
        <View style={{ width: `${reservePercent}%`, backgroundColor: t.colors.accent }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" color="textSoft">{humanLabel}</Text>
        <Text variant="caption" weight="semibold">{current.toFixed(2)}{currency}</Text>
      </View>
    </View>
  );
}
