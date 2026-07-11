import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export interface DateSeparatorProps {
  date: string;
}

/** Centered date pill separator in chat. */
export function DateSeparator({ date }: DateSeparatorProps) {
  const { theme: t } = useTheme();

  return (
    <View style={{ alignItems: 'center', paddingVertical: t.spacing[3] }}>
      <View
        style={{
          backgroundColor: t.colors.pale,
          borderRadius: t.radius.full,
          paddingHorizontal: t.spacing[3],
          paddingVertical: t.spacing[1],
        }}
      >
        <Text variant="caption" weight="medium" color="textSoft">{date}</Text>
      </View>
    </View>
  );
}
