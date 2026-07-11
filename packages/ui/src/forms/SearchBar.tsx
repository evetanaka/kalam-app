import React from 'react';
import { View, TextInput } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

/** Rounded search input with magnifier icon and clear button. */
export function SearchBar({ value, onChange, placeholder = 'Rechercher...' }: SearchBarProps) {
  const { theme: t } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: t.colors.backgroundAlt,
        borderRadius: t.radius.full,
        paddingHorizontal: t.spacing[3],
        height: 40,
      }}
    >
      <Text style={{ fontSize: 16, marginRight: t.spacing[2] }}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textSoft}
        style={{
          flex: 1,
          color: t.colors.text,
          fontFamily: t.typography.fontFamily.body,
          fontSize: t.typography.fontSize.md,
        }}
        accessibilityRole="search"
        accessibilityLabel="Search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange('')} minHitSlop={32}>
          <Text style={{ fontSize: 16, color: t.colors.textSoft }}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}
