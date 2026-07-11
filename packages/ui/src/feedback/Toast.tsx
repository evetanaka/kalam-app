import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss?: () => void;
}

const variantBg = (t: Theme) => ({
  success: t.colors.primary,
  error: t.colors.danger,
  info: t.colors.primaryDeep,
});

/** Ephemeral notification toast with auto-dismiss. */
export function Toast({ message, variant = 'info', duration = 3000, onDismiss }: ToastProps) {
  const { theme: t } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: t.animations.fast, useNativeDriver: true }),
      Animated.delay(duration),
      Animated.timing(opacity, { toValue: 0, duration: t.animations.fast, useNativeDriver: true }),
    ]).start(() => onDismiss?.());
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        position: 'absolute',
        bottom: 80,
        left: t.spacing[4],
        right: t.spacing[4],
        backgroundColor: variantBg(t)[variant],
        borderRadius: t.radius.lg,
        padding: t.spacing[4],
        ...t.shadows.lg,
      }}
      accessibilityRole="alert"
    >
      <Text color="textOnPrimary" weight="medium">{message}</Text>
    </Animated.View>
  );
}
