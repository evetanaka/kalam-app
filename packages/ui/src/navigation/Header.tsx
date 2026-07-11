import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export interface HeaderProps {
  title: string;
  /** Left action element (e.g. back button) */
  leftAction?: React.ReactNode;
  /** Right action element */
  rightAction?: React.ReactNode;
  /** Transparent background */
  transparent?: boolean;
  /** Blur effect (visual hint, actual blur depends on platform) */
  blur?: boolean;
}

/** Top navigation bar with title and action slots. */
export function Header({ title, leftAction, rightAction, transparent, blur }: HeaderProps) {
  const { theme: t } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: t.spacing[4],
        backgroundColor: transparent ? 'transparent' : t.colors.header,
      }}
      accessibilityRole="header"
    >
      <View style={{ minWidth: 44, alignItems: 'flex-start' }}>{leftAction}</View>
      <Text variant="h4" color="textOnPrimary" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
        {title}
      </Text>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{rightAction}</View>
    </View>
  );
}
