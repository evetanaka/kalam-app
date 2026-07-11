import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export type MessageStatusType = 'sent' | 'delivered' | 'read' | 'encrypted';

export interface MessageStatusProps {
  status: MessageStatusType;
  /** Animate lock icon flash (200ms) */
  animated?: boolean;
}

/** Message status indicator: ✓ sent, ✓✓ delivered, ✓✓ colored = read, 🔒 encrypted. */
export function MessageStatus({ status, animated }: MessageStatusProps) {
  const { theme: t } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated && status === 'encrypted') {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: t.animations.lockFlash / 2, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: t.animations.lockFlash / 2, useNativeDriver: true }),
      ]).start();
    }
  }, [status, animated]);

  const icon = (() => {
    switch (status) {
      case 'sent': return { text: '✓', color: t.colors.textSoft };
      case 'delivered': return { text: '✓✓', color: t.colors.textSoft };
      case 'read': return { text: '✓✓', color: t.colors.checks };
      case 'encrypted': return { text: '🔒', color: t.colors.accent };
    }
  })();

  return (
    <Animated.View style={{ opacity }}>
      <Text style={{ fontSize: t.typography.fontSize.xs, color: icon.color }}>{icon.text}</Text>
    </Animated.View>
  );
}
