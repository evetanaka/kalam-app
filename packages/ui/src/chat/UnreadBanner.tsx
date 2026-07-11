import React from 'react';
import { useTheme } from '@kalam/theme';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface UnreadBannerProps {
  count: number;
  onPress: () => void;
}

/** "↓ X nouveaux messages" banner. */
export function UnreadBanner({ count, onPress }: UnreadBannerProps) {
  const { theme: t } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: t.colors.primary,
        borderRadius: t.radius.full,
        paddingHorizontal: t.spacing[4],
        paddingVertical: t.spacing[2],
        alignSelf: 'center',
        ...t.shadows.md,
      }}
      accessibilityLabel={`${count} nouveaux messages`}
    >
      <Text color="textOnPrimary" weight="semibold" size="sm">↓ {count} nouveaux messages</Text>
    </Pressable>
  );
}
