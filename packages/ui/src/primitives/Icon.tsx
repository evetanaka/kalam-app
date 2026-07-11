import React from 'react';
import { View } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';

export interface IconProps {
  /** Icon name (Phosphor icon identifier) */
  name: string;
  /** Size in px */
  size?: number;
  /** Color token */
  color?: keyof Theme['colors'];
  /** Icon weight */
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

/**
 * Icon wrapper for Phosphor Icons.
 * Renders a placeholder view sized correctly — actual icon rendering
 * depends on the Phosphor Icons package being installed.
 *
 * @example <Icon name="chat-circle" size={24} color="primary" />
 */
export function Icon({ name, size = 24, color = 'text', weight = 'regular' }: IconProps) {
  const { theme } = useTheme();
  // Placeholder: actual Phosphor integration will map `name` to the component
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: 'transparent',
      }}
      accessibilityRole="image"
      accessibilityLabel={name}
    />
  );
}
