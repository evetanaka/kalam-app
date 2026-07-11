import React from 'react';
import { View, Switch } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export interface ToggleProps {
  value: boolean;
  onChange: (val: boolean) => void;
  /** Label text */
  label: string;
  /** Description text */
  description?: string;
}

/** Switch toggle with label and optional description for settings screens. */
export function Toggle({ value, onChange, label, description }: ToggleProps) {
  const { theme: t } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: t.spacing[3],
        minHeight: 44,
      }}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
    >
      <View style={{ flex: 1, marginRight: t.spacing[3] }}>
        <Text variant="body">{label}</Text>
        {description && <Text variant="caption" color="textSoft">{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: t.colors.border, true: t.colors.primary }}
        thumbColor={t.colors.textOnPrimary}
      />
    </View>
  );
}
