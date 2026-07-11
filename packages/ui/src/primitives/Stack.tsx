import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';

export interface StackProps extends ViewProps {
  /** Gap between children (spacing token key) */
  spacing?: keyof Theme['spacing'];
  /** Alignment */
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  /** Justify content */
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  /** Wrap children */
  wrap?: boolean;
}

/**
 * Vertical stack layout with token-based spacing.
 */
export function VStack({ spacing, align, justify, wrap, style, ...props }: StackProps) {
  const { theme: t } = useTheme();
  return (
    <View
      {...props}
      style={[
        { flexDirection: 'column' },
        spacing != null && { gap: t.spacing[spacing] },
        align && { alignItems: align },
        justify && { justifyContent: justify },
        wrap && { flexWrap: 'wrap' },
        style,
      ]}
    />
  );
}

/**
 * Horizontal stack layout with token-based spacing.
 */
export function HStack({ spacing, align, justify, wrap, style, ...props }: StackProps) {
  const { theme: t } = useTheme();
  return (
    <View
      {...props}
      style={[
        { flexDirection: 'row' },
        spacing != null && { gap: t.spacing[spacing] },
        align && { alignItems: align },
        justify && { justifyContent: justify },
        wrap && { flexWrap: 'wrap' },
        style,
      ]}
    />
  );
}
