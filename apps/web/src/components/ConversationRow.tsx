import React, { useCallback } from 'react';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Avatar, Badge, Text } from '@kalam/ui';
import type { Conversation } from '@kalam/stores';

interface ConversationRowProps {
  conversation: Conversation;
  isActive?: boolean;
  onPress: (id: string) => void;
  onContextMenu?: (id: string) => void;
}

function formatRelativeTime(timestamp: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('time.justNow');
  if (minutes < 60) return t('time.minutesAgo', { count: minutes });
  if (hours < 24) {
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  if (days === 1) return t('time.yesterday');
  if (days < 7) return t('time.daysAgo', { count: days });
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function ConversationRowInner({ conversation, isActive, onPress, onContextMenu }: ConversationRowProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const timeStr = conversation.lastMessage
    ? formatRelativeTime(conversation.lastMessage.timestamp, t)
    : '';
  const previewText = conversation.lastMessage?.text ?? '';

  const handleClick = useCallback(() => onPress(conversation.id), [conversation.id, onPress]);
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(conversation.id);
  }, [conversation.id, onContextMenu]);

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: `${theme.spacing[3]}px ${theme.spacing[4]}px`,
        cursor: 'pointer',
        backgroundColor: isActive ? theme.colors.pale : 'transparent',
        transition: 'background-color 150ms',
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = theme.colors.backgroundAlt || '#f5f5f5';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = isActive ? theme.colors.pale : 'transparent';
      }}
    >
      <Avatar size="md" name={conversation.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0, marginRight: 8 }}>
            <span style={{
              fontWeight: 600,
              fontSize: theme.typography.fontSize.md,
              color: theme.colors.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {conversation.name}
            </span>
            {conversation.isPinned && <span style={{ fontSize: 12 }}>📌</span>}
            {conversation.isMuted && <span style={{ fontSize: 12 }}>🔇</span>}
          </div>
          <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSoft, whiteSpace: 'nowrap' }}>
            {timeStr}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
          <span style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSoft,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            marginRight: 8,
          }}>
            {previewText}
          </span>
          {conversation.unreadCount > 0 && (
            <Badge variant="primary" count={conversation.unreadCount} />
          )}
        </div>
      </div>
    </div>
  );
}

export const ConversationRow = React.memo(ConversationRowInner);
