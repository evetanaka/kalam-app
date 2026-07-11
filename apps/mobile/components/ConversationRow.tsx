import React, { useCallback, useRef } from 'react';
import { View, Animated, PanResponder, StyleSheet } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Avatar, Badge, Pressable, Text } from '@kalam/ui';
import type { Conversation } from '@kalam/stores/src/conversationStore';

interface ConversationRowProps {
  conversation: Conversation;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
  onPin: (id: string) => void;
  onMute: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Format timestamp to relative string */
function formatRelativeTime(timestamp: number, t: (key: string, opts?: any) => string): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('time.justNow');
  if (minutes < 60) return t('time.minutesAgo', { count: minutes });
  if (hours < 24) {
    // Show time for today
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  if (days === 1) return t('time.yesterday');
  if (days < 7) return t('time.daysAgo', { count: days });
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const SWIPE_THRESHOLD = 80;

/**
 * A single conversation row with swipe actions and long-press support.
 */
function ConversationRowInner({
  conversation,
  onPress,
  onLongPress,
  onPin,
  onMute,
  onDelete,
}: ConversationRowProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dy) < 10,
      onPanResponderMove: (_, gs) => {
        translateX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -SWIPE_THRESHOLD) {
          // Swipe left → delete
          Animated.spring(translateX, { toValue: -120, useNativeDriver: true }).start();
        } else if (gs.dx > SWIPE_THRESHOLD) {
          // Swipe right → pin
          Animated.spring(translateX, { toValue: 120, useNativeDriver: true }).start();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  const resetSwipe = useCallback(() => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
  }, [translateX]);

  const handlePin = useCallback(() => {
    onPin(conversation.id);
    resetSwipe();
  }, [conversation.id, onPin, resetSwipe]);

  const handleMute = useCallback(() => {
    onMute(conversation.id);
    resetSwipe();
  }, [conversation.id, onMute, resetSwipe]);

  const handleDelete = useCallback(() => {
    onDelete(conversation.id);
    resetSwipe();
  }, [conversation.id, onDelete, resetSwipe]);

  const timeStr = conversation.lastMessage
    ? formatRelativeTime(conversation.lastMessage.timestamp, t)
    : '';

  const previewText = conversation.lastMessage?.text ?? '';

  return (
    <View style={styles.rowContainer}>
      {/* Right swipe action (pin) */}
      <View style={[styles.swipeAction, styles.swipeLeft, { backgroundColor: theme.colors.accent }]}>
        <Pressable onPress={handlePin} style={styles.swipeButton}>
          <Text style={{ fontSize: 20 }}>{conversation.isPinned ? '📌' : '📌'}</Text>
          <Text color="text" variant="caption" weight="medium">
            {conversation.isPinned ? t('conversations.unpin') : t('conversations.pin')}
          </Text>
        </Pressable>
      </View>

      {/* Left swipe actions (mute, delete) */}
      <View style={[styles.swipeAction, styles.swipeRight]}>
        <Pressable
          onPress={handleMute}
          style={[styles.swipeButton, { backgroundColor: theme.colors.accent }]}
        >
          <Text style={{ fontSize: 20 }}>{conversation.isMuted ? '🔔' : '🔇'}</Text>
        </Pressable>
        <Pressable
          onPress={handleDelete}
          style={[styles.swipeButton, { backgroundColor: theme.colors.danger }]}
        >
          <Text style={{ fontSize: 20 }}>🗑</Text>
        </Pressable>
      </View>

      {/* Main row */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={() => onPress(conversation.id)}
          onLongPress={() => onLongPress(conversation.id)}
          style={[
            styles.row,
            {
              paddingHorizontal: theme.spacing[4],
              paddingVertical: theme.spacing[3],
              backgroundColor: theme.colors.background,
            },
          ]}
          minHitSlop={0}
        >
          <Avatar size="md" name={conversation.name} />

          <View style={styles.content}>
            <View style={styles.topLine}>
              <View style={styles.nameRow}>
                <Text variant="body" weight="semibold" numberOfLines={1} style={styles.name}>
                  {conversation.name}
                </Text>
                {conversation.isPinned && (
                  <Text style={{ fontSize: 12 }}>📌</Text>
                )}
                {conversation.isMuted && (
                  <Text style={{ fontSize: 12 }}>🔇</Text>
                )}
              </View>
              <Text variant="caption" color="textSoft">
                {timeStr}
              </Text>
            </View>

            <View style={styles.bottomLine}>
              <Text
                variant="caption"
                color="textSoft"
                numberOfLines={1}
                style={styles.preview}
              >
                {previewText}
              </Text>
              {conversation.unreadCount > 0 && (
                <Badge variant="primary" count={conversation.unreadCount} />
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export const ConversationRow = React.memo(ConversationRowInner);

const styles = StyleSheet.create({
  rowContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  swipeLeft: {
    left: 0,
    width: 120,
    alignItems: 'center',
  },
  swipeRight: {
    right: 0,
    flexDirection: 'row',
  },
  swipeButton: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  name: {
    flexShrink: 1,
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    marginRight: 8,
  },
});
