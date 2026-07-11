import { useCallback, useMemo } from 'react';
import { useMessageStore } from '@kalam/stores';
import { useConversationStore } from '@kalam/stores';
import { useAuthStore } from '@kalam/stores';
import { useWalletStore } from '@kalam/stores';
import type { Message } from '@kalam/stores';

/**
 * Hook encapsulating chat logic: messages, sending, reactions.
 */
export function useChat(conversationId: string) {
  const messagesByConversation = useMessageStore((s) => s.messagesByConversation);
  const addMessage = useMessageStore((s) => s.addMessage);
  const removeMessage = useMessageStore((s) => s.removeMessage);
  const addReaction = useMessageStore((s) => s.addReaction);
  const removeReaction = useMessageStore((s) => s.removeReaction);
  const updateConversation = useConversationStore((s) => s.updateConversation);
  const incrementWeeklyMessages = useWalletStore((s) => s.incrementWeeklyMessages);
  const account = useAuthStore((s) => s.account);

  const messages = useMemo(() => {
    const msgs = messagesByConversation[conversationId] ?? [];
    return [...msgs].sort((a, b) => b.timestamp - a.timestamp);
  }, [messagesByConversation, conversationId]);

  const allMessages = messagesByConversation[conversationId] ?? [];

  const currentUserId = account?.address ?? 'me';

  const sendMessage = useCallback(
    (text: string, quotedMessageId?: string) => {
      const now = Date.now();
      const id = `msg-${now}-${Math.random().toString(36).slice(2, 8)}`;
      const message: Message = {
        id,
        conversationId,
        senderId: currentUserId,
        text,
        timestamp: now,
        status: 'sent',
        type: 'text',
        quotedMessageId,
        reactions: [],
        isEphemeral: false,
        isFailed: false,
      };

      addMessage(message);
      updateConversation(conversationId, {
        lastMessage: {
          text,
          timestamp: now,
          status: 'sent',
          senderId: currentUserId,
        },
        updatedAt: now,
      });
      incrementWeeklyMessages();
    },
    [conversationId, currentUserId, addMessage, updateConversation, incrementWeeklyMessages],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      removeMessage(conversationId, messageId);
    },
    [conversationId, removeMessage],
  );

  const toggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      const msg = allMessages.find((m) => m.id === messageId);
      if (!msg) return;
      const existing = msg.reactions.find((r) => r.emoji === emoji);
      if (existing && existing.userIds.includes(currentUserId)) {
        removeReaction(conversationId, messageId, emoji, currentUserId);
      } else {
        addReaction(conversationId, messageId, emoji, currentUserId);
      }
    },
    [conversationId, currentUserId, allMessages, addReaction, removeReaction],
  );

  const findMessage = useCallback(
    (id: string): Message | undefined => {
      return allMessages.find((m) => m.id === id);
    },
    [allMessages],
  );

  const formatTime = useCallback((timestamp: number): string => {
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }, []);

  return {
    messages,
    currentUserId,
    sendMessage,
    deleteMessage,
    toggleReaction,
    findMessage,
    formatTime,
  };
}
