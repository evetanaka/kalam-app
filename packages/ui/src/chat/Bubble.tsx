import React from 'react';
import { View } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';
import { Text } from '../primitives/Text';
import { MessageStatus, type MessageStatusType } from './MessageStatus';
import { QuotedMessage } from './QuotedMessage';

type BubbleVariant = 'in' | 'out' | 'system' | 'value';

export interface BubbleProps {
  variant: BubbleVariant;
  text: string;
  time: string;
  status?: MessageStatusType;
  isLast?: boolean;
  hasReactions?: boolean;
  quotedMessage?: { senderName: string; text: string };
  /** Sender name (for group chats) */
  senderName?: string;
  /** Sender color (for group chats) */
  senderColor?: string;
}

const getBubbleColors = (variant: BubbleVariant, t: Theme) => {
  switch (variant) {
    case 'in': return { bg: t.colors.bubbleIn, text: t.colors.text };
    case 'out': return { bg: t.colors.bubbleOut, text: t.colors.text };
    case 'system': return { bg: t.colors.pale, text: t.colors.textSoft };
    case 'value': return { bg: t.colors.accentLight, text: t.colors.text };
  }
};

/**
 * Chat bubble — the core messaging component.
 * Radius 16px with 4-5px anchor corner on the last bubble in a group.
 */
export function Bubble({
  variant, text, time, status, isLast, hasReactions,
  quotedMessage, senderName, senderColor,
}: BubbleProps) {
  const { theme: t } = useTheme();
  const isOut = variant === 'out' || variant === 'value';
  const isSystem = variant === 'system';
  const colors = getBubbleColors(variant, t);

  if (isSystem) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: t.spacing[2] }}>
        <View style={{ backgroundColor: colors.bg, borderRadius: t.radius.full, paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[1] }}>
          <Text variant="caption" style={{ color: colors.text }}>{text}</Text>
        </View>
      </View>
    );
  }

  const anchorRadius = isLast ? 4 : 16;

  return (
    <View
      style={{
        alignSelf: isOut ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        marginBottom: hasReactions ? t.spacing[4] : t.spacing[1],
      }}
    >
      <View
        style={{
          backgroundColor: colors.bg,
          borderRadius: 16,
          borderBottomRightRadius: isOut && isLast ? anchorRadius : 16,
          borderBottomLeftRadius: !isOut && isLast ? anchorRadius : 16,
          paddingHorizontal: t.spacing[3],
          paddingTop: t.spacing[2],
          paddingBottom: t.spacing[1],
          ...t.shadows.sm,
        }}
        accessibilityRole="text"
      >
        {senderName && (
          <Text
            variant="caption"
            weight="semibold"
            style={{ color: senderColor ?? t.colors.primary, marginBottom: t.spacing[1] }}
          >
            {senderName}
          </Text>
        )}
        {quotedMessage && (
          <QuotedMessage senderName={quotedMessage.senderName} text={quotedMessage.text} />
        )}
        <Text variant="body" style={{ color: colors.text }}>{text}</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: t.spacing[1],
            marginTop: t.spacing[1],
          }}
        >
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.textSoft }}>{time}</Text>
          {status && isOut && <MessageStatus status={status} />}
        </View>
      </View>
    </View>
  );
}
