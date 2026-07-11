import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface Tab {
  label: string;
  icon?: React.ReactNode;
}

export interface TabBarProps {
  tabs: Tab[];
  activeIndex: number;
  onChange: (index: number) => void;
}

/** Bottom tab bar for main navigation. */
export function TabBar({ tabs, activeIndex, onChange }: TabBarProps) {
  const { theme: t } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        height: 64,
        borderTopWidth: 1,
        borderTopColor: t.colors.border,
        backgroundColor: t.colors.background,
        paddingBottom: t.spacing[1],
      }}
      accessibilityRole="tablist"
    >
      {tabs.map((tab, i) => {
        const active = i === activeIndex;
        return (
          <Pressable
            key={i}
            onPress={() => onChange(i)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: t.spacing[2],
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            minHitSlop={44}
          >
            {tab.icon}
            <Text
              variant="caption"
              color={active ? 'primary' : 'textSoft'}
              weight={active ? 'semibold' : 'regular'}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
