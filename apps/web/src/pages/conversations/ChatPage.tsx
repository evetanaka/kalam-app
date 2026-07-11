import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Header, Text, Avatar, SecurityBadge, DateSeparator } from '@kalam/ui';
import { useConversationStore } from '@kalam/stores/src/conversationStore';
import { useMessageStore, type Message } from '@kalam/stores/src/messageStore';
import { MessageItem } from '../../components/MessageItem';
import { ChatInputBar } from '../../components/ChatInputBar';
import { useChat } from '../../hooks/useChat';

function seedMockMessages(conversationId: string, addMessage: (m: Message) => void) {
  const now = Date.now();
  const me = 'me';
  const other = 'alice';

  const mocks: Partial<Message>[] = [
    { senderId: other, text: 'Salut ! Comment ça va ?', timestamp: now - 3600000 * 4, status: 'read' },
    { senderId: me, text: 'Ça va bien merci ! Et toi ?', timestamp: now - 3600000 * 3.9, status: 'read' },
    { senderId: other, text: "Super ! J'ai trouvé un super restaurant pour ce soir", timestamp: now - 3600000 * 3.8, status: 'read' },
    { senderId: me, text: "Ah cool ! C'est où ?", timestamp: now - 3600000 * 3.7, status: 'read' },
    { senderId: other, text: "Rue de la Paix, tu connais ? C'est un petit italien authentique avec des pâtes fraîches faites maison. Le chef vient de Naples et les critiques sont excellentes.", timestamp: now - 3600000 * 3.6, status: 'read' },
    { senderId: me, text: '👍', timestamp: now - 3600000 * 3.5, status: 'read' },
    { senderId: other, text: 'On réserve pour 20h ?', timestamp: now - 3600000 * 2, status: 'read' },
    { senderId: me, text: 'Parfait ! Je serai là', timestamp: now - 3600000 * 1.9, status: 'delivered' },
    { senderId: other, text: 'Tu peux inviter Marie aussi si tu veux', timestamp: now - 3600000 * 1.5, status: 'read' },
    { senderId: me, text: 'Bonne idée, je lui envoie un message', timestamp: now - 3600000 * 1.4, status: 'delivered' },
    { senderId: other, text: 'Super ❤️', timestamp: now - 3600000, status: 'read' },
    { senderId: me, text: 'Marie est dispo !', timestamp: now - 1800000, status: 'sent', quotedMessageId: 'mock-msg-9' },
    { senderId: other, text: 'Excellent ! On va bien manger 🍝', timestamp: now - 900000, status: 'read' },
    { senderId: me, text: "J'ai hâte !", timestamp: now - 600000, status: 'sent' },
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

export function ChatPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const conversationId = id ?? '';

  const conversations = useConversationStore((s) => s.conversations);
  const conversation = conversations.find((c) => c.id === conversationId);
  const markAsRead = useConversationStore((s) => s.markAsRead);
  const addMessageToStore = useMessageStore((s) => s.addMessage);
  const messagesByConversation = useMessageStore((s) => s.messagesByConversation);

  const { messages, currentUserId, sendMessage, deleteMessage, toggleReaction, findMessage } = useChat(conversationId);

  const [quotedMessage, setQuotedMessage] = useState<{ id: string; senderName: string; text: string } | null>(null);

  useEffect(() => {
    const existing = messagesByConversation[conversationId];
    if (!existing || existing.length === 0) seedMockMessages(conversationId, addMessageToStore);
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) markAsRead(conversationId);
  }, [conversationId, markAsRead]);

  const handleSend = useCallback((text: string) => {
    sendMessage(text, quotedMessage?.id);
    setQuotedMessage(null);
  }, [sendMessage, quotedMessage]);

  const handleLongPress = useCallback((message: Message) => {
    // Simple context menu actions
    const action = window.prompt('Action: reply, copy, delete', 'reply');
    if (action === 'reply') {
      setQuotedMessage({
        id: message.id,
        senderName: message.senderId === currentUserId ? 'Vous' : (conversation?.name ?? ''),
        text: message.text,
      });
    } else if (action === 'copy') {
      navigator.clipboard.writeText(message.text).catch(() => {});
    } else if (action === 'delete') {
      deleteMessage(message.id);
    }
  }, [currentUserId, conversation, deleteMessage]);

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji);
  }, [toggleReaction]);

  // Build list items (reversed for bottom-up display)
  const listItems = useMemo(() => {
    const items: Array<{ type: 'message'; message: Message; isLast: boolean } | { type: 'date'; date: string; key: string }> = [];
    // messages is sorted newest first
    const reversed = [...messages]; // newest first

    for (let i = 0; i < reversed.length; i++) {
      const msg = reversed[i];
      const prevMsg = i > 0 ? reversed[i - 1] : null;
      const nextMsg = reversed[i + 1];
      const isLast = !prevMsg || prevMsg.senderId !== msg.senderId;

      items.push({ type: 'message', message: msg, isLast });

      if (nextMsg && isDifferentDay(msg.timestamp, nextMsg.timestamp)) {
        items.push({ type: 'date', date: formatDateSeparator(nextMsg.timestamp, t), key: `date-${nextMsg.timestamp}` });
      }
      if (i === reversed.length - 1) {
        items.push({ type: 'date', date: formatDateSeparator(msg.timestamp, t), key: `date-${msg.timestamp}` });
      }
    }

    return items.reverse(); // oldest first for normal scroll
  }, [messages, t]);

  if (!conversation) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--soft)' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 48 }}>💬</span>
          <p style={{ marginTop: 16, fontSize: 16 }}>Sélectionnez une conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        height: 56, padding: '0 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '0.5px solid var(--hair)', backgroundColor: 'white',
      }}>
        <Avatar size="sm" name={conversation.name} />
        <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>{conversation.name}</span>
      </div>

      {/* Crypto line */}
      <div style={{
        height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: theme.colors.pale,
      }}>
        <SecurityBadge verified />
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '8px 0',
        display: 'flex', flexDirection: 'column',
      }}>
        {listItems.map((item) => {
          if (item.type === 'date') {
            return <DateSeparator key={item.key} date={item.date} />;
          }
          const msg = item.message;
          let quoted: { senderName: string; text: string } | undefined;
          if (msg.quotedMessageId) {
            const qm = findMessage(msg.quotedMessageId);
            if (qm) quoted = { senderName: qm.senderId === currentUserId ? 'Vous' : (conversation.name ?? ''), text: qm.text };
          }
          return (
            <MessageItem
              key={msg.id}
              message={msg}
              isLast={item.isLast}
              currentUserId={currentUserId}
              quotedMessage={quoted}
              onLongPress={handleLongPress}
              onReaction={handleReaction}
            />
          );
        })}
      </div>

      {/* Input */}
      <ChatInputBar
        onSend={handleSend}
        quotedMessage={quotedMessage}
        onCancelQuote={() => setQuotedMessage(null)}
      />
    </div>
  );
}
