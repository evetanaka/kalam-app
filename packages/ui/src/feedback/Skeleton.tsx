import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '@kalam/theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
}

/** Animated skeleton placeholder for loading states. */
export function Skeleton({ width = '100%', height = 16, radius = 8 }: SkeletonProps) {
  const { theme: t } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius: radius,
        backgroundColor: t.colors.border,
        opacity,
      }}
      accessibilityRole="none"
    />
  );
}
