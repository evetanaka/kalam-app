import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';

export interface QuotedMessageProps {
  senderName: string;
  text: string;
  onPress?: () => void;
}

/** Quoted message preview with green left bar. */
export function QuotedMessage({ senderName, text, onPress }: QuotedMessageProps) {
  const { theme: t } = useTheme();

  const content = (
    <View
      style={{
        borderLeftWidth: 3,
        borderLeftColor: t.colors.primary,
        paddingLeft: t.spacing[2],
        paddingVertical: t.spacing[1],
        backgroundColor: t.colors.pale,
        borderRadius: t.radius.sm,
        marginBottom: t.spacing[1],
      }}
    >
      <Text variant="caption" color="primary" weight="semibold" numberOfLines={1}>{senderName}</Text>
      <Text variant="caption" color="textSoft" numberOfLines={2}>{text}</Text>
    </View>
  );

  return onPress ? (
    <Pressable onPress={onPress} accessibilityLabel={`Quoted message from ${senderName}`} minHitSlop={0}>
      {content}
    </Pressable>
  ) : content;
}
