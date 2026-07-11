import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface Reaction {
  emoji: string;
  count: number;
  isMine: boolean;
}

export interface ReactionBarProps {
  reactions: Reaction[];
  onPress: (emoji: string) => void;
}

/** Reaction pills displayed below a chat bubble. */
export function ReactionBar({ reactions, onPress }: ReactionBarProps) {
  const { theme: t } = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[1], marginTop: t.spacing[1] }}>
      {reactions.map((r) => (
        <Pressable
          key={r.emoji}
          onPress={() => onPress(r.emoji)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: r.isMine ? t.colors.pale : t.colors.backgroundAlt,
            borderRadius: t.radius.full,
            borderWidth: r.isMine ? 1 : 0,
            borderColor: t.colors.primary,
            paddingHorizontal: t.spacing[2],
            paddingVertical: 2,
            gap: t.spacing[1],
          }}
          accessibilityLabel={`${r.emoji} ${r.count}`}
          minHitSlop={32}
        >
          <Text style={{ fontSize: t.typography.fontSize.sm }}>{r.emoji}</Text>
          <Text variant="caption" color={r.isMine ? 'primary' : 'textSoft'} weight="medium">{r.count}</Text>
        </Pressable>
      ))}
    </View>
  );
}
