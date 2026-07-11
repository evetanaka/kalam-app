import React, { useCallback } from 'react';
import { useTheme } from '@kalam/theme';
import { Bubble, ReactionBar } from '@kalam/ui';
import type { Message } from '@kalam/stores';
import type { MessageStatusType } from '@kalam/ui';

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  currentUserId: string;
  quotedMessage?: { senderName: string; text: string };
  onLongPress: (message: Message) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

function mapStatus(status: Message['status']): MessageStatusType {
  switch (status) {
    case 'sending': return 'sent';
    case 'sent': return 'sent';
    case 'delivered': return 'delivered';
    case 'read': return 'read';
  }
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

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

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress(message);
  }, [message, onLongPress]);

  const handleReaction = useCallback(
    (emoji: string) => onReaction(message.id, emoji),
    [message.id, onReaction],
  );

  return (
    <div style={{ padding: '0 8px' }} onContextMenu={handleContextMenu}>
      <Bubble
        variant={variant}
        text={message.text}
        time={formatTime(message.timestamp)}
        status={isOut ? mapStatus(message.status) : undefined}
        isLast={isLast}
        hasReactions={hasReactions}
        quotedMessage={quotedMessage}
      />
      {hasReactions && (
        <div style={{
          marginTop: -4,
          paddingLeft: 12,
          paddingRight: 12,
          marginBottom: 4,
          display: 'flex',
          justifyContent: isOut ? 'flex-end' : 'flex-start',
        }}>
          <ReactionBar reactions={reactions} onPress={handleReaction} />
        </div>
      )}
    </div>
  );
}

export const MessageItem = React.memo(MessageItemInner);
