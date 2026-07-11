import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import {
  Screen,
  Header,
  SearchBar,
  Text,
  Pressable,
  Avatar,
  QuotedMessage,
  Divider,
  Badge,
} from '@kalam/ui';
import { useConversationStore, type Conversation } from '@kalam/stores/src/conversationStore';
import { useMessageStore } from '@kalam/stores/src/messageStore';

export default function ForwardMessageScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { messageId, conversationId } = useLocalSearchParams<{ messageId: string; conversationId: string }>();

  const conversations = useConversationStore((s) => s.conversations);
  const messagesByConversation = useMessageStore((s) => s.messagesByConversation);
  const addMessage = useMessageStore((s) => s.addMessage);
  const updateConversation = useConversationStore((s) => s.updateConversation);

  // Find the original message
  const originalMessage = useMemo(() => {
    const msgs = messagesByConversation[conversationId ?? ''] ?? [];
    return msgs.find((m) => m.id === messageId);
  }, [messagesByConversation, conversationId, messageId]);

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredConversations = useMemo(() => {
    if (!search) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, search]);

  const toggleConversation = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleForward = useCallback(() => {
    if (!originalMessage || selectedIds.size === 0) return;

    const now = Date.now();
    selectedIds.forEach((targetId) => {
      const newMsg = {
        id: `msg-fwd-${now}-${Math.random().toString(36).slice(2, 8)}`,
        conversationId: targetId,
        senderId: 'me',
        text: originalMessage.text,
        timestamp: now,
        status: 'sent' as const,
        type: originalMessage.type,
        reactions: [],
        isEphemeral: false,
        isFailed: false,
        forwardedFrom: conversationId,
      };
      addMessage(newMsg);
      updateConversation(targetId, {
        lastMessage: { text: originalMessage.text, timestamp: now, status: 'sent', senderId: 'me' },
        updatedAt: now,
      });
    });

    router.back();
  }, [originalMessage, selectedIds, addMessage, updateConversation, conversationId, router]);

  const renderConversation = useCallback(
    ({ item }: { item: Conversation }) => {
      const isSelected = selectedIds.has(item.id);
      return (
        <Pressable
          onPress={() => toggleConversation(item.id)}
          style={[styles.row, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}
          minHitSlop={0}
        >
          <Avatar size="md" name={item.name} />
          <Text variant="body" weight="medium" style={styles.name}>{item.name}</Text>
          <View style={[styles.checkbox, {
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            backgroundColor: isSelected ? theme.colors.primary : 'transparent',
          }]}>
            {isSelected && <Text color="textOnPrimary" style={{ fontSize: 12 }}>✓</Text>}
          </View>
        </Pressable>
      );
    },
    [theme, selectedIds, toggleConversation],
  );

  return (
    <Screen>
      <Header
        title={t('forward.title')}
        leftAction={
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>
        }
        rightAction={
          selectedIds.size > 0 ? (
            <Pressable onPress={handleForward}>
              <Text color="primary" weight="bold">{t('forward.send')} ({selectedIds.size})</Text>
            </Pressable>
          ) : undefined
        }
      />

      {/* Message preview */}
      {originalMessage && (
        <View style={[styles.preview, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3], backgroundColor: theme.colors.backgroundAlt }]}>
          <QuotedMessage senderName="" text={originalMessage.text} />
        </View>
      )}

      {/* Selected badges */}
      {selectedIds.size > 0 && (
        <View style={[styles.badgeRow, { paddingHorizontal: theme.spacing[4] }]}>
          {[...selectedIds].map((id) => {
            const conv = conversations.find((c) => c.id === id);
            return conv ? (
              <Pressable key={id} onPress={() => toggleConversation(id)} style={[styles.badge, { backgroundColor: theme.colors.pale, borderRadius: theme.radius.xl }]} minHitSlop={0}>
                <Text variant="caption" weight="medium">{conv.name} ✕</Text>
              </Pressable>
            ) : null;
          })}
        </View>
      )}

      <View style={[styles.searchContainer, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2] }]}>
        <SearchBar value={search} onChange={setSearch} placeholder={t('forward.search')} />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {},
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  searchContainer: {},
  list: { flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
  },
  name: { flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
