import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, memberColor } from '@kalam/theme';
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
import { useConversationStore, type Conversation } from '@kalam/stores/src/conversationStore';
import { useMessageStore, type Message } from '@kalam/stores/src/messageStore';
import { MessageItem } from '../../../components/MessageItem';
import { ChatInputBar } from '../../../components/ChatInputBar';
import { SearchOverlay } from '../../../components/SearchOverlay';
import { useChat } from '../../../hooks/useChat';

/** Seed mock group messages for demo */
function seedGroupMessages(conversationId: string, addMessage: (m: Message) => void) {
  const now = Date.now();
  const members = ['alice', 'bob', 'charlie', 'me'];
  const names: Record<string, string> = { alice: 'Alice.kalam', bob: 'Bob.kalam', charlie: 'Charlie.kalam', me: 'Vous' };

  const texts = [
    { s: 'alice', t: 'Salut tout le monde ! 👋' },
    { s: 'bob', t: 'Hey ! Quoi de neuf ?' },
    { s: 'me', t: 'Yo ! Prêts pour le projet ?' },
    { s: 'charlie', t: 'Oui, j\'ai commencé les maquettes' },
    { s: 'alice', t: 'Super ! Tu peux partager ?' },
    { s: 'charlie', t: 'Je les envoie ce soir' },
    { s: 'bob', t: 'Parfait, on avance bien' },
    { s: 'me', t: 'Le backend est presque prêt aussi' },
    { s: 'alice', t: 'On fait un point demain à 10h ?' },
    { s: 'bob', t: '10h ça me va 👍' },
    { s: 'charlie', t: 'Pareil pour moi' },
    { s: 'me', t: 'OK, je crée l\'event' },
    { s: 'alice', t: 'Merci !' },
    { s: 'bob', t: 'Au fait, avez-vous vu le nouveau design ?' },
    { s: 'charlie', t: 'Oui c\'est clean ! J\'adore les couleurs' },
    { s: 'me', t: 'Le vert Kalam est parfait 💚' },
    { s: 'alice', t: 'On devrait ajouter des animations aussi' },
    { s: 'bob', t: 'Bonne idée, mais pas trop pour les perf' },
    { s: 'charlie', t: 'Je suis d\'accord avec Bob' },
    { s: 'me', t: 'On en reparle demain alors ! 🚀' },
  ];

  texts.forEach((m, i) => {
    addMessage({
      id: `group-msg-${i}`,
      conversationId,
      senderId: m.s,
      text: m.t,
      timestamp: now - (20 - i) * 300000,
      status: 'read',
      type: 'text',
      reactions: [],
      isEphemeral: false,
      isFailed: false,
    });
  });
}

function isDifferentDay(t1: number, t2: number): boolean {
  return new Date(t1).toDateString() !== new Date(t2).toDateString();
}

function formatDateSeparator(timestamp: number, t: (key: string) => string): string {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return t('chat.dateSeparator.today');
  if (d.toDateString() === yesterday.toDateString()) return t('chat.dateSeparator.yesterday');
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

const ESTIMATED_ITEM_HEIGHT = 72;

export default function GroupChatScreen() {
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
  const [showSearch, setShowSearch] = useState(false);

  const members = conversation?.members ?? [];
  const memberNames = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach((m) => { map[m.id] = m.name; });
    return map;
  }, [members]);

  // Seed mock messages on first mount
  useEffect(() => {
    const existing = messagesByConversation[conversationId];
    if (!existing || existing.length === 0) {
      seedGroupMessages(conversationId, addMessageToStore);
    }
  }, [conversationId]);

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
    (messageId: string, emoji: string) => toggleReaction(messageId, emoji),
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
        case 0:
          setQuotedMessage({
            id: selectedMessage.id,
            senderName: selectedMessage.senderId === currentUserId
              ? 'Vous'
              : (memberNames[selectedMessage.senderId] ?? selectedMessage.senderId),
            text: selectedMessage.text,
          });
          break;
        case 1:
          router.push({ pathname: '/(tabs)/conversations/forward-message', params: { messageId: selectedMessage.id, conversationId } });
          break;
        case 2:
          try { Clipboard.setString(selectedMessage.text); } catch {}
          break;
        case 3:
          deleteMessage(selectedMessage.id);
          break;
      }
      setSelectedMessage(null);
    },
    [selectedMessage, currentUserId, memberNames, deleteMessage, router, conversationId],
  );

  const listData = useMemo(() => {
    const items: Array<{ type: 'message'; message: Message; isLast: boolean } | { type: 'date'; date: string; key: string }> = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const nextMsg = messages[i + 1];
      const prevMsg = i > 0 ? messages[i - 1] : null;
      const isLast = !prevMsg || prevMsg.senderId !== msg.senderId;

      items.push({ type: 'message', message: msg, isLast });

      if (nextMsg && isDifferentDay(msg.timestamp, nextMsg.timestamp)) {
        items.push({ type: 'date', date: formatDateSeparator(nextMsg.timestamp, t), key: `date-${nextMsg.timestamp}` });
      }
      if (i === messages.length - 1) {
        items.push({ type: 'date', date: formatDateSeparator(msg.timestamp, t), key: `date-${msg.timestamp}` });
      }
    }
    return items;
  }, [messages, t]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof listData)[number] }) => {
      if (item.type === 'date') return <DateSeparator date={item.date} />;

      const msg = item.message;
      const isOut = msg.senderId === currentUserId;
      let quoted: { senderName: string; text: string } | undefined;
      if (msg.quotedMessageId) {
        const qm = findMessage(msg.quotedMessageId);
        if (qm) {
          quoted = {
            senderName: qm.senderId === currentUserId ? 'Vous' : (memberNames[qm.senderId] ?? qm.senderId),
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
          senderName={!isOut ? (memberNames[msg.senderId] ?? msg.senderId) : undefined}
          senderColor={!isOut ? memberColor(msg.senderId) : undefined}
        />
      );
    },
    [currentUserId, memberNames, findMessage, handleLongPress, handleReaction],
  );

  const keyExtractor = useCallback(
    (item: (typeof listData)[number]) => item.type === 'date' ? item.key : item.message.id,
    [],
  );

  // Group avatar: show first 4 members
  const avatarMembers = members.slice(0, 4);

  return (
    <Screen>
      <Header
        title={conversation?.name ?? ''}
        leftAction={
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>
        }
        rightAction={
          <View style={styles.headerRight}>
            <Pressable onPress={() => setShowSearch(true)} style={styles.searchBtn} minHitSlop={0}>
              <Text style={{ fontSize: 18 }}>🔍</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push({ pathname: '/(tabs)/conversations/conversation-info', params: { id: conversationId, type: 'group' } })}
              style={styles.infoBtn}
              minHitSlop={0}
            >
              <View style={styles.miniAvatarGrid}>
                {avatarMembers.map((m) => (
                  <Avatar key={m.id} size="xs" name={m.name} />
                ))}
              </View>
            </Pressable>
          </View>
        }
      />

      <View style={[styles.cryptoLine, { backgroundColor: theme.dark ? theme.colors.backgroundAlt : theme.colors.pale }]}>
        <SecurityBadge verified />
        <Text variant="caption" color="textSoft" style={{ marginLeft: 8 }}>
          {t('chat.members', { count: members.length })}
        </Text>
      </View>

      {showSearch && (
        <SearchOverlay
          messages={messagesByConversation[conversationId] ?? []}
          onClose={() => setShowSearch(false)}
          onNavigate={() => {}}
        />
      )}

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted
        contentContainerStyle={styles.messageList}
        keyboardShouldPersistTaps="handled"
      />

      <ChatInputBar
        onSend={handleSend}
        quotedMessage={quotedMessage}
        onCancelQuote={() => setQuotedMessage(null)}
      />

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
  searchBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  infoBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 40,
    height: 40,
    gap: 1,
  },
  cryptoLine: {
    height: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingVertical: 8,
  },
});
