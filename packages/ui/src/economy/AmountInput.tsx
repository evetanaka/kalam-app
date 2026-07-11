import React from 'react';
import { View, TextInput } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface AmountInputProps {
  value: string;
  onChange: (val: string) => void;
  /** Preset amounts */
  presets?: number[];
  currency?: string;
}

/** Amount input with preset pill buttons (e.g. 10/25/100€). */
export function AmountInput({ value, onChange, presets = [10, 25, 100], currency = '€' }: AmountInputProps) {
  const { theme: t } = useTheme();

  return (
    <View style={{ gap: t.spacing[4] }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.spacing[2],
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          style={{
            fontSize: t.typography.fontSize['4xl'],
            fontFamily: t.typography.fontFamily.display,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.text,
            textAlign: 'center',
            minWidth: 80,
          }}
          accessibilityLabel="Amount"
        />
        <Text variant="h2" color="textSoft">{currency}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: t.spacing[2] }}>
        {presets.map((amount) => (
          <Pressable
            key={amount}
            onPress={() => onChange(String(amount))}
            style={{
              backgroundColor: value === String(amount) ? t.colors.primary : t.colors.backgroundAlt,
              borderRadius: t.radius.full,
              paddingHorizontal: t.spacing[4],
              paddingVertical: t.spacing[2],
            }}
            accessibilityLabel={`${amount}${currency}`}
          >
            <Text
              weight="semibold"
              color={value === String(amount) ? 'textOnPrimary' : 'text'}
            >
              {amount}{currency}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
