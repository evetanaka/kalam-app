import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Bubble, ReactionBar, Pressable } from '@kalam/ui';
import type { Message } from '@kalam/stores/src/messageStore';
import type { MessageStatusType } from '@kalam/ui';

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  currentUserId: string;
  /** Quoted message data if quotedMessageId is set */
  quotedMessage?: { senderName: string; text: string } | undefined;
  onLongPress: (message: Message) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

/** Map store message status to UI MessageStatus type */
function mapStatus(status: Message['status']): MessageStatusType {
  switch (status) {
    case 'sending':
      return 'sent';
    case 'sent':
      return 'sent';
    case 'delivered':
      return 'delivered';
    case 'read':
      return 'read';
  }
}

/** Format timestamp to HH:MM */
function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Renders a single message using the Bubble component.
 * Handles reactions, quoted messages, and long press.
 */
function MessageItemInner({
  message,
  isLast,
  currentUserId,
  quotedMessage,
  onLongPress,
  onReaction,
}: MessageItemProps) {
  const { theme } = useTheme();
  const isOut = message.senderId === currentUserId;
  const variant = message.type === 'system' ? 'system' : isOut ? 'out' : 'in';

  const reactions = message.reactions.map((r) => ({
    emoji: r.emoji,
    count: r.userIds.length,
    isMine: r.userIds.includes(currentUserId),
  }));

  const hasReactions = reactions.length > 0;

  const handleLongPress = useCallback(() => {
    onLongPress(message);
  }, [message, onLongPress]);

  const handleReaction = useCallback(
    (emoji: string) => {
      onReaction(message.id, emoji);
    },
    [message.id, onReaction],
  );

  return (
    <View style={styles.container}>
      <Pressable
        onLongPress={handleLongPress}
        style={styles.pressable}
        minHitSlop={0}
        activeOpacity={1}
      >
        <Bubble
          variant={variant}
          text={message.text}
          time={formatTime(message.timestamp)}
          status={isOut ? mapStatus(message.status) : undefined}
          isLast={isLast}
          hasReactions={hasReactions}
          quotedMessage={quotedMessage}
        />
      </Pressable>
      {hasReactions && (
        <View style={[styles.reactions, { alignSelf: isOut ? 'flex-end' : 'flex-start' }]}>
          <ReactionBar reactions={reactions} onPress={handleReaction} />
        </View>
      )}
    </View>
  );
}

export const MessageItem = React.memo(MessageItemInner);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  pressable: {
    minHeight: 0,
    minWidth: 0,
  },
  reactions: {
    marginTop: -4,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
});
