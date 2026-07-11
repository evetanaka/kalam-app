import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme, memberColor } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Avatar, SecurityBadge, DateSeparator, Text } from '@kalam/ui';
import { useConversationStore, useMessageStore, type Message } from '@kalam/stores';
import { MessageItem } from '../../components/MessageItem';
import { ChatInputBar } from '../../components/ChatInputBar';
import { SearchOverlay } from '../../components/SearchOverlay';
import { useChat } from '../../hooks/useChat';

function seedGroupMessages(conversationId: string, addMessage: (m: Message) => void) {
  const now = Date.now();
  const texts = [
    { s: 'alice', t: 'Salut tout le monde ! 👋' },
    { s: 'bob', t: 'Hey ! Quoi de neuf ?' },
    { s: 'me', t: 'Yo ! Prêts pour le projet ?' },
    { s: 'charlie', t: "J'ai commencé les maquettes" },
    { s: 'alice', t: 'Super ! Tu peux partager ?' },
    { s: 'charlie', t: 'Je les envoie ce soir' },
    { s: 'bob', t: 'Parfait, on avance bien' },
    { s: 'me', t: 'Le backend est presque prêt aussi' },
    { s: 'alice', t: 'On fait un point demain à 10h ?' },
    { s: 'bob', t: '10h ça me va 👍' },
    { s: 'charlie', t: 'Pareil pour moi' },
    { s: 'me', t: "OK, je crée l'event" },
    { s: 'alice', t: 'Merci !' },
    { s: 'bob', t: 'Au fait, avez-vous vu le nouveau design ?' },
    { s: 'charlie', t: "Oui c'est clean ! J'adore les couleurs" },
    { s: 'me', t: 'Le vert Kalam est parfait 💚' },
    { s: 'alice', t: 'On devrait ajouter des animations aussi' },
    { s: 'bob', t: 'Bonne idée, mais pas trop pour les perf' },
    { s: 'charlie', t: "Je suis d'accord avec Bob" },
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

export function GroupChatPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const conversationId = id ?? '';

  const conversations = useConversationStore((s) => s.conversations);
  const conversation = conversations.find((c) => c.id === conversationId);
  const markAsRead = useConversationStore((s) => s.markAsRead);
  const addMessageToStore = useMessageStore((s) => s.addMessage);
  const messagesByConversation = useMessageStore((s) => s.messagesByConversation);

  const { messages, currentUserId, sendMessage, deleteMessage, toggleReaction, findMessage } = useChat(conversationId);

  const [quotedMessage, setQuotedMessage] = useState<{ id: string; senderName: string; text: string } | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const members = conversation?.members ?? [];
  const memberNames = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach((m) => { map[m.id] = m.name; });
    return map;
  }, [members]);

  useEffect(() => {
    const existing = messagesByConversation[conversationId];
    if (!existing || existing.length === 0) seedGroupMessages(conversationId, addMessageToStore);
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) markAsRead(conversationId);
  }, [conversationId, markAsRead]);

  const handleSend = useCallback((text: string) => {
    sendMessage(text, quotedMessage?.id);
    setQuotedMessage(null);
  }, [sendMessage, quotedMessage]);

  const handleLongPress = useCallback((message: Message) => {
    const action = window.prompt('Action: reply, forward, copy, delete', 'reply');
    if (action === 'reply') {
      setQuotedMessage({
        id: message.id,
        senderName: message.senderId === currentUserId ? 'Vous' : (memberNames[message.senderId] ?? message.senderId),
        text: message.text,
      });
    } else if (action === 'forward') {
      navigate(`/forward?messageId=${message.id}&conversationId=${conversationId}`);
    } else if (action === 'copy') {
      navigator.clipboard.writeText(message.text).catch(() => {});
    } else if (action === 'delete') {
      deleteMessage(message.id);
    }
  }, [currentUserId, memberNames, deleteMessage, navigate, conversationId]);

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji);
  }, [toggleReaction]);

  const listItems = useMemo(() => {
    const items: Array<{ type: 'message'; message: Message; isLast: boolean } | { type: 'date'; date: string; key: string }> = [];
    const reversed = [...messages];
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
    return items.reverse();
  }, [messages, t]);

  if (!conversation) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--soft)' }}>
        <p>Sélectionnez une conversation</p>
      </div>
    );
  }

  const avatarMembers = members.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        height: 56, padding: '0 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '0.5px solid var(--hair)', backgroundColor: 'white',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', width: 40, height: 40, gap: 1 }}>
          {avatarMembers.map((m) => <Avatar key={m.id} size="xs" name={m.name} />)}
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>{conversation.name}</span>
          <div style={{ fontSize: 12, color: 'var(--soft)' }}>{t('chat.members', { count: members.length })}</div>
        </div>
        <button onClick={() => setShowSearch((s) => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, minWidth: 44, minHeight: 44 }}>🔍</button>
        <button onClick={() => navigate(`/conversation-info/${conversationId}?type=group`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, minWidth: 44, minHeight: 44 }}>ℹ️</button>
      </div>

      {/* Crypto line */}
      <div style={{ height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.pale, gap: 8 }}>
        <SecurityBadge verified />
        <Text variant="caption" color="textSoft">{t('chat.members', { count: members.length })}</Text>
      </div>

      {showSearch && (
        <SearchOverlay
          messages={messagesByConversation[conversationId] ?? []}
          onClose={() => setShowSearch(false)}
          onNavigate={() => {}}
        />
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
        {listItems.map((item) => {
          if (item.type === 'date') return <DateSeparator key={item.key} date={item.date} />;
          const msg = item.message;
          const isOut = msg.senderId === currentUserId;
          let quoted: { senderName: string; text: string } | undefined;
          if (msg.quotedMessageId) {
            const qm = findMessage(msg.quotedMessageId);
            if (qm) quoted = { senderName: qm.senderId === currentUserId ? 'Vous' : (memberNames[qm.senderId] ?? qm.senderId), text: qm.text };
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
              senderName={!isOut ? (memberNames[msg.senderId] ?? msg.senderId) : undefined}
              senderColor={!isOut ? memberColor(msg.senderId) : undefined}
            />
          );
        })}
      </div>

      <ChatInputBar onSend={handleSend} quotedMessage={quotedMessage} onCancelQuote={() => setQuotedMessage(null)} />
    </div>
  );
}
