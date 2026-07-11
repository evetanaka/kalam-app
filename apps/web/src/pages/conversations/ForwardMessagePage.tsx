import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { SearchBar, Avatar, QuotedMessage, Text } from '@kalam/ui';
import { useConversationStore, useMessageStore, type Conversation } from '@kalam/stores';

export function ForwardMessagePage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messageId = searchParams.get('messageId') ?? '';
  const conversationId = searchParams.get('conversationId') ?? '';

  const conversations = useConversationStore((s) => s.conversations);
  const messagesByConversation = useMessageStore((s) => s.messagesByConversation);
  const addMessage = useMessageStore((s) => s.addMessage);
  const updateConversation = useConversationStore((s) => s.updateConversation);

  const originalMessage = useMemo(() => {
    const msgs = messagesByConversation[conversationId] ?? [];
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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleForward = useCallback(() => {
    if (!originalMessage || selectedIds.size === 0) return;
    const now = Date.now();
    selectedIds.forEach((targetId) => {
      addMessage({
        id: `msg-fwd-${now}-${Math.random().toString(36).slice(2, 8)}`,
        conversationId: targetId,
        senderId: 'me',
        text: originalMessage.text,
        timestamp: now,
        status: 'sent',
        type: originalMessage.type,
        reactions: [],
        isEphemeral: false,
        isFailed: false,
        forwardedFrom: conversationId,
      });
      updateConversation(targetId, {
        lastMessage: { text: originalMessage.text, timestamp: now, status: 'sent', senderId: 'me' },
        updatedAt: now,
      });
    });
    navigate(-1);
  }, [originalMessage, selectedIds, addMessage, updateConversation, conversationId, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '0.5px solid var(--hair)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, minWidth: 44, minHeight: 44 }}>←</button>
          <span style={{ fontWeight: 600, fontSize: 16, marginLeft: 8 }}>{t('forward.title')}</span>
        </div>
        {selectedIds.size > 0 && (
          <button onClick={handleForward} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.primary, fontWeight: 'bold', fontSize: 15, minHeight: 44 }}>
            {t('forward.send')} ({selectedIds.size})
          </button>
        )}
      </div>

      {originalMessage && (
        <div style={{ padding: `${theme.spacing[3]}px ${theme.spacing[4]}px`, backgroundColor: theme.colors.backgroundAlt }}>
          <QuotedMessage senderName="" text={originalMessage.text} />
        </div>
      )}

      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', flexWrap: 'wrap' }}>
          {[...selectedIds].map((id) => {
            const conv = conversations.find((c) => c.id === id);
            return conv ? (
              <div key={id} onClick={() => toggleConversation(id)} style={{
                backgroundColor: theme.colors.pale, borderRadius: theme.radius.xl,
                padding: '4px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}>{conv.name} ✕</div>
            ) : null;
          })}
        </div>
      )}

      <div style={{ padding: '8px 12px' }}>
        <SearchBar value={search} onChange={setSearch} placeholder={t('forward.search')} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredConversations.map((c) => {
          const isSelected = selectedIds.has(c.id);
          return (
            <div
              key={c.id}
              onClick={() => toggleConversation(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: `${theme.spacing[3]}px ${theme.spacing[4]}px`,
                cursor: 'pointer', minHeight: 44,
                borderBottom: `0.5px solid ${theme.colors.border}`,
              }}
            >
              <Avatar size="md" name={c.name} />
              <span style={{ flex: 1, fontWeight: 500, color: theme.colors.text }}>{c.name}</span>
              <div style={{
                width: 24, height: 24, borderRadius: 12, border: `2px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
                backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 12,
              }}>{isSelected ? '✓' : ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
