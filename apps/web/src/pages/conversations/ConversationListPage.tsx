import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { SearchBar, Text, EmptyState } from '@kalam/ui';
import { useConversationStore, type Conversation } from '@kalam/stores/src/conversationStore';
import { useWalletStore } from '@kalam/stores/src/walletStore';
import { ConversationRow } from '../../components/ConversationRow';

function formatCost(cents: number): string {
  if (cents < 1) return '< 0,01';
  return (cents / 100).toFixed(2).replace('.', ',');
}

function seedMockConversations(addConversation: (c: Conversation) => void) {
  const now = Date.now();
  const mocks: Conversation[] = [
    { id: 'conv-1', type: 'direct', name: 'Alice.kalam', avatarUrl: null, lastMessage: { text: 'Salut ! Tu es dispo ce soir ?', timestamp: now - 300000, status: 'read', senderId: 'alice' }, unreadCount: 0, isPinned: true, isMuted: false, isEphemeral: false, memberIds: ['alice'], updatedAt: now - 300000 },
    { id: 'conv-2', type: 'direct', name: 'Bob.kalam', avatarUrl: null, lastMessage: { text: 'Le paiement a bien été reçu 👍', timestamp: now - 3600000, status: 'delivered', senderId: 'bob' }, unreadCount: 2, isPinned: false, isMuted: false, isEphemeral: false, memberIds: ['bob'], updatedAt: now - 3600000 },
    { id: 'conv-3', type: 'direct', name: 'Charlie.kalam', avatarUrl: null, lastMessage: { text: 'On se retrouve où demain ?', timestamp: now - 86400000, status: 'sent', senderId: 'me' }, unreadCount: 0, isPinned: false, isMuted: true, isEphemeral: false, memberIds: ['charlie'], updatedAt: now - 86400000 },
    { id: 'conv-4', type: 'direct', name: 'Diana.kalam', avatarUrl: null, lastMessage: { text: 'Merci pour le lien !', timestamp: now - 172800000, status: 'read', senderId: 'diana' }, unreadCount: 5, isPinned: false, isMuted: false, isEphemeral: true, ephemeralDuration: 86400, memberIds: ['diana'], updatedAt: now - 172800000 },
    { id: 'conv-5', type: 'direct', name: 'Eve.kalam', avatarUrl: null, lastMessage: { text: '🔒 Message chiffré envoyé', timestamp: now - 604800000, status: 'delivered', senderId: 'me' }, unreadCount: 0, isPinned: false, isMuted: false, isEphemeral: false, memberIds: ['eve'], updatedAt: now - 604800000 },
  ];
  mocks.forEach((c) => addConversation(c));
}

interface ConversationListPageProps {
  activeId?: string;
}

export function ConversationListPage({ activeId }: ConversationListPageProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const conversations = useConversationStore((s) => s.conversations);
  const addConversation = useConversationStore((s) => s.addConversation);
  const weeklyMessageCount = useWalletStore((s) => s.weeklyMessageCount);
  const weeklyEstimatedCostCents = useWalletStore((s) => s.weeklyEstimatedCostCents);

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (conversations.length === 0) seedMockConversations(addConversation);
  }, []);

  const sortedConversations = useMemo(() => {
    let filtered = conversations;
    if (search) {
      const q = search.toLowerCase();
      filtered = conversations.filter((c) => c.name.toLowerCase().includes(q));
    }
    return [...filtered].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [conversations, search]);

  const handlePress = useCallback((id: string) => navigate(`/chat/${id}`), [navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        height: 56, padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '0.5px solid var(--hair)',
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--deep)' }}>
          {t('conversations.title')}
        </span>
        <button
          onClick={() => navigate('/new')}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: theme.colors.primary,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: 22,
          }}
          aria-label={t('conversations.newConversation')}
        >+</button>
      </div>

      <div style={{ padding: '8px 12px' }}>
        <SearchBar value={search} onChange={setSearch} placeholder={t('common.search')} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sortedConversations.length === 0 && !search ? (
          <EmptyState
            icon={<span style={{ fontSize: 48 }}>💬</span>}
            title={t('conversations.empty.title')}
            description={t('conversations.empty.subtitle')}
            action={t('conversations.newConversation')}
            onAction={() => navigate('/new')}
          />
        ) : (
          sortedConversations.map((c) => (
            <ConversationRow
              key={c.id}
              conversation={c}
              isActive={c.id === activeId}
              onPress={handlePress}
            />
          ))
        )}
      </div>

      {weeklyMessageCount > 0 && (
        <div style={{
          padding: `${theme.spacing[2]}px 16px`,
          backgroundColor: theme.colors.backgroundAlt,
          textAlign: 'center',
        }}>
          <Text variant="caption" color="textSoft">
            {t('chat.weeklyCounter', { count: weeklyMessageCount, cost: formatCost(weeklyEstimatedCostCents) })}
          </Text>
        </div>
      )}
    </div>
  );
}
