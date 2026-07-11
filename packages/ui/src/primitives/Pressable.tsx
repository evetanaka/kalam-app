import React, { useCallback, useRef } from 'react';
import {
  Pressable as RNPressable,
  Animated,
  type PressableProps as RNPressableProps,
  type ViewStyle,
} from 'react-native';

export interface PressableProps extends RNPressableProps {
  /** Opacity when pressed */
  activeOpacity?: number;
  /** Minimum touch target in px */
  minHitSlop?: number;
}

/**
 * Enhanced Pressable with opacity animation and minimum 44px touch target.
 */
export function Pressable({
  activeOpacity = 0.7,
  minHitSlop = 44,
  disabled,
  style,
  ...props
}: PressableProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(opacity, {
      toValue: activeOpacity,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [activeOpacity, opacity]);

  const handlePressOut = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity: disabled ? 0.4 : opacity }}>
      <RNPressable
        {...props}
        disabled={disabled}
        onPressIn={(e) => { handlePressIn(); props.onPressIn?.(e); }}
        onPressOut={(e) => { handlePressOut(); props.onPressOut?.(e); }}
        style={[{ minHeight: minHitSlop, minWidth: minHitSlop } as ViewStyle, style as any]}
        accessibilityRole="button"
      />
    </Animated.View>
  );
}
