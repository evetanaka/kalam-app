import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Clipboard } from 'react-native';
import {
  Screen,
  Header,
  Text,
  Pressable,
  Avatar,
  SecurityBadge,
  DateSeparator,
  ActionSheet,
  type ActionSheetAction,
} from '@kalam/ui';
import { useConversationStore } from '@kalam/stores/src/conversationStore';
import { useMessageStore, type Message } from '@kalam/stores/src/messageStore';
import { MessageItem } from '../../../components/MessageItem';
import { ChatInputBar } from '../../../components/ChatInputBar';
import { useChat } from '../../../hooks/useChat';

/** Seed mock messages for demo */
function seedMockMessages(conversationId: string, addMessage: (m: Message) => void) {
  const now = Date.now();
  const me = 'me';
  const other = 'alice';

  const mocks: Partial<Message>[] = [
    { senderId: other, text: 'Salut ! Comment ça va ?', timestamp: now - 3600000 * 4, status: 'read' },
    { senderId: me, text: 'Ça va bien merci ! Et toi ?', timestamp: now - 3600000 * 3.9, status: 'read' },
    { senderId: other, text: 'Super ! J\'ai trouvé un super restaurant pour ce soir', timestamp: now - 3600000 * 3.8, status: 'read' },
    { senderId: me, text: 'Ah cool ! C\'est où ?', timestamp: now - 3600000 * 3.7, status: 'read' },
    { senderId: other, text: 'Rue de la Paix, tu connais ? C\'est un petit italien authentique avec des pâtes fraîches faites maison. Le chef vient de Naples et les critiques sont excellentes.', timestamp: now - 3600000 * 3.6, status: 'read' },
    { senderId: me, text: '👍', timestamp: now - 3600000 * 3.5, status: 'read' },
    { senderId: other, text: 'On réserve pour 20h ?', timestamp: now - 3600000 * 2, status: 'read' },
    { senderId: me, text: 'Parfait ! Je serai là', timestamp: now - 3600000 * 1.9, status: 'delivered' },
    { senderId: other, text: 'Tu peux inviter Marie aussi si tu veux', timestamp: now - 3600000 * 1.5, status: 'read' },
    { senderId: me, text: 'Bonne idée, je lui envoie un message', timestamp: now - 3600000 * 1.4, status: 'delivered' },
    { senderId: other, text: 'Super ❤️', timestamp: now - 3600000, status: 'read' },
    { senderId: me, text: 'Marie est dispo !', timestamp: now - 1800000, status: 'sent', quotedMessageId: 'mock-msg-9' },
    { senderId: other, text: 'Excellent ! On va bien manger 🍝', timestamp: now - 900000, status: 'read' },
    { senderId: me, text: 'J\'ai hâte !', timestamp: now - 600000, status: 'sent' },
    { senderId: other, text: 'À ce soir alors ! 🎉', timestamp: now - 300000, status: 'read' },
  ];

  mocks.forEach((m, i) => {
    addMessage({
      id: `mock-msg-${i}`,
      conversationId,
      senderId: m.senderId!,
      text: m.text!,
      timestamp: m.timestamp!,
      status: m.status as Message['status'],
      type: 'text',
      quotedMessageId: m.quotedMessageId,
      reactions: i === 10 ? [{ emoji: '❤️', userIds: [me] }] : i === 4 ? [{ emoji: '😍', userIds: [other] }, { emoji: '🔥', userIds: [me, other] }] : [],
      isEphemeral: false,
      isFailed: false,
    });
  });
}

/** Check if two timestamps are on different days */
function isDifferentDay(t1: number, t2: number): boolean {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  return d1.toDateString() !== d2.toDateString();
}

/** Format date for separator */
function formatDateSeparator(timestamp: number, t: (key: string) => string): string {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return t('chat.dateSeparator.today');
  if (d.toDateString() === yesterday.toDateString()) return t('chat.dateSeparator.yesterday');
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// Estimated item height for getItemLayout
const ESTIMATED_ITEM_HEIGHT = 72;

export default function ChatScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id ?? '';

  const conversations = useConversationStore((s) => s.conversations);
  const conversation = conversations.find((c) => c.id === conversationId);
  const markAsRead = useConversationStore((s) => s.markAsRead);
  const addMessageToStore = useMessageStore((s) => s.addMessage);
  const messagesByConversation = useMessageStore((s) => s.messagesByConversation);

  const { messages, currentUserId, sendMessage, deleteMessage, toggleReaction, findMessage } =
    useChat(conversationId);

  const [quotedMessage, setQuotedMessage] = useState<{ id: string; senderName: string; text: string } | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Seed mock messages on first mount
  useEffect(() => {
    const existing = messagesByConversation[conversationId];
    if (!existing || existing.length === 0) {
      seedMockMessages(conversationId, addMessageToStore);
    }
  }, [conversationId]);

  // Mark as read on mount
  useEffect(() => {
    if (conversationId) markAsRead(conversationId);
  }, [conversationId, markAsRead]);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text, quotedMessage?.id);
      setQuotedMessage(null);
    },
    [sendMessage, quotedMessage],
  );

  const handleLongPress = useCallback((message: Message) => {
    setSelectedMessage(message);
    setActionSheetOpen(true);
  }, []);

  const handleReaction = useCallback(
    (messageId: string, emoji: string) => {
      toggleReaction(messageId, emoji);
    },
    [toggleReaction],
  );

  const actionSheetActions: ActionSheetAction[] = [
    { label: t('chat.reply'), icon: <Text style={{ fontSize: 18 }}>↩️</Text> },
    { label: t('chat.forward'), icon: <Text style={{ fontSize: 18 }}>↗️</Text> },
    { label: t('chat.copyMessage'), icon: <Text style={{ fontSize: 18 }}>📋</Text> },
    { label: t('chat.deleteMessage'), icon: <Text style={{ fontSize: 18 }}>🗑</Text>, destructive: true },
  ];

  const handleActionSelect = useCallback(
    (index: number) => {
      if (!selectedMessage) return;
      switch (index) {
        case 0: // Reply
          setQuotedMessage({
            id: selectedMessage.id,
            senderName: selectedMessage.senderId === currentUserId ? 'Vous' : (conversation?.name ?? ''),
            text: selectedMessage.text,
          });
          break;
        case 1: // Forward — placeholder
          break;
        case 2: // Copy
          try {
            Clipboard.setString(selectedMessage.text);
          } catch {
            // Clipboard may not be available
          }
          break;
        case 3: // Delete
          deleteMessage(selectedMessage.id);
          break;
      }
      setSelectedMessage(null);
    },
    [selectedMessage, currentUserId, conversation, deleteMessage],
  );

  /** Build list data with date separators */
  const listData = useMemo(() => {
    // messages is already sorted newest-first for inverted list
    const items: Array<{ type: 'message'; message: Message; isLast: boolean } | { type: 'date'; date: string; key: string }> = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const nextMsg = messages[i + 1]; // older message (inverted)

      // isLast: last message in consecutive group from same sender
      const prevMsg = i > 0 ? messages[i - 1] : null; // newer message
      const isLast = !prevMsg || prevMsg.senderId !== msg.senderId;

      items.push({ type: 'message', message: msg, isLast });

      // Add date separator if next message is on a different day
      if (nextMsg && isDifferentDay(msg.timestamp, nextMsg.timestamp)) {
        items.push({
          type: 'date',
          date: formatDateSeparator(nextMsg.timestamp, t),
          key: `date-${nextMsg.timestamp}`,
        });
      }

      // Add date separator for the oldest message
      if (i === messages.length - 1) {
        items.push({
          type: 'date',
          date: formatDateSeparator(msg.timestamp, t),
          key: `date-${msg.timestamp}`,
        });
      }
    }

    return items;
  }, [messages, t]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof listData)[number] }) => {
      if (item.type === 'date') {
        return <DateSeparator date={item.date} />;
      }

      const msg = item.message;
      let quoted: { senderName: string; text: string } | undefined;
      if (msg.quotedMessageId) {
        const qm = findMessage(msg.quotedMessageId);
        if (qm) {
          quoted = {
            senderName: qm.senderId === currentUserId ? 'Vous' : (conversation?.name ?? ''),
            text: qm.text,
          };
        }
      }

      return (
        <MessageItem
          message={msg}
          isLast={item.isLast}
          currentUserId={currentUserId}
          quotedMessage={quoted}
          onLongPress={handleLongPress}
          onReaction={handleReaction}
        />
      );
    },
    [currentUserId, conversation, findMessage, handleLongPress, handleReaction],
  );

  const keyExtractor = useCallback(
    (item: (typeof listData)[number]) => {
      if (item.type === 'date') return item.key;
      return item.message.id;
    },
    [],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ESTIMATED_ITEM_HEIGHT,
      offset: ESTIMATED_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <Screen>
      {/* Header */}
      <Header
        title={conversation?.name ?? ''}
        leftAction={
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>
        }
        rightAction={
          <View style={styles.headerRight}>
            <Avatar size="sm" name={conversation?.name ?? ''} />
          </View>
        }
      />

      {/* Crypto line */}
      <View style={[styles.cryptoLine, { backgroundColor: theme.dark ? theme.colors.backgroundAlt : theme.colors.pale }]}>
        <SecurityBadge verified />
      </View>

      {/* Messages list */}
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.messageList}
        keyboardShouldPersistTaps="handled"
      />

      {/* Input bar */}
      <ChatInputBar
        onSend={handleSend}
        quotedMessage={quotedMessage}
        onCancelQuote={() => setQuotedMessage(null)}
      />

      {/* Action sheet for message long press */}
      <ActionSheet
        open={actionSheetOpen}
        actions={actionSheetActions}
        onSelect={handleActionSelect}
        onCancel={() => setActionSheetOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cryptoLine: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingVertical: 8,
  },
});
