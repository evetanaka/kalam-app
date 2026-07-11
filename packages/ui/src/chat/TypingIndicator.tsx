import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '@kalam/theme';

/** Three animated dots in a bubble indicating typing. */
export function TypingIndicator() {
  const { theme: t } = useTheme();
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: t.colors.bubbleIn,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        paddingHorizontal: t.spacing[4],
        paddingVertical: t.spacing[3],
        flexDirection: 'row',
        gap: t.spacing[1],
        ...t.shadows.sm,
      }}
      accessibilityLabel="Someone is typing"
    >
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: t.colors.textSoft,
            opacity: dot,
          }}
        />
      ))}
    </View>
  );
}
