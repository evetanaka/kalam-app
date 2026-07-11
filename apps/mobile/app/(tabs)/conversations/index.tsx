import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import {
  Screen,
  Header,
  SearchBar,
  EmptyState,
  Text,
  Pressable,
  ActionSheet,
  type ActionSheetAction,
} from '@kalam/ui';
import { useConversationStore, type Conversation } from '@kalam/stores/src/conversationStore';
import { useWalletStore } from '@kalam/stores/src/walletStore';
import { ConversationRow } from '../../../components/ConversationRow';

/** Format cost in cents to display string */
function formatCost(cents: number): string {
  if (cents < 1) return '< 0,01';
  return (cents / 100).toFixed(2).replace('.', ',');
}

/** Seed mock conversations for demo */
function seedMockConversations(addConversation: (c: Conversation) => void) {
  const now = Date.now();
  const mocks: Conversation[] = [
    {
      id: 'conv-1',
      type: 'direct',
      name: 'Alice.kalam',
      avatarUrl: null,
      lastMessage: { text: 'Salut ! Tu es dispo ce soir ?', timestamp: now - 300000, status: 'read', senderId: 'alice' },
      unreadCount: 0,
      isPinned: true,
      isMuted: false,
      isEphemeral: false,
      memberIds: ['alice'],
      updatedAt: now - 300000,
    },
    {
      id: 'conv-2',
      type: 'direct',
      name: 'Bob.kalam',
      avatarUrl: null,
      lastMessage: { text: 'Le paiement a bien été reçu 👍', timestamp: now - 3600000, status: 'delivered', senderId: 'bob' },
      unreadCount: 2,
      isPinned: false,
      isMuted: false,
      isEphemeral: false,
      memberIds: ['bob'],
      updatedAt: now - 3600000,
    },
    {
      id: 'conv-3',
      type: 'direct',
      name: 'Charlie.kalam',
      avatarUrl: null,
      lastMessage: { text: 'On se retrouve où demain ?', timestamp: now - 86400000, status: 'sent', senderId: 'me' },
      unreadCount: 0,
      isPinned: false,
      isMuted: true,
      isEphemeral: false,
      memberIds: ['charlie'],
      updatedAt: now - 86400000,
    },
    {
      id: 'conv-4',
      type: 'direct',
      name: 'Diana.kalam',
      avatarUrl: null,
      lastMessage: { text: 'Merci pour le lien !', timestamp: now - 172800000, status: 'read', senderId: 'diana' },
      unreadCount: 5,
      isPinned: false,
      isMuted: false,
      isEphemeral: true,
      ephemeralDuration: 86400,
      memberIds: ['diana'],
      updatedAt: now - 172800000,
    },
    {
      id: 'conv-5',
      type: 'direct',
      name: 'Eve.kalam',
      avatarUrl: null,
      lastMessage: { text: '🔒 Message chiffré envoyé', timestamp: now - 604800000, status: 'delivered', senderId: 'me' },
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isEphemeral: false,
      memberIds: ['eve'],
      updatedAt: now - 604800000,
    },
  ];

  mocks.forEach((c) => addConversation(c));
}

export default function ConversationsIndexScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const conversations = useConversationStore((s) => s.conversations);
  const addConversation = useConversationStore((s) => s.addConversation);
  const togglePin = useConversationStore((s) => s.togglePin);
  const toggleMute = useConversationStore((s) => s.toggleMute);
  const removeConversation = useConversationStore((s) => s.removeConversation);
  const weeklyMessageCount = useWalletStore((s) => s.weeklyMessageCount);
  const weeklyEstimatedCostCents = useWalletStore((s) => s.weeklyEstimatedCostCents);

  const [search, setSearch] = useState('');
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Seed mock data on first mount if empty
  useEffect(() => {
    if (conversations.length === 0) {
      seedMockConversations(addConversation);
    }
  }, []);

  // Sort: pinned first, then by updatedAt desc
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

  const handlePress = useCallback(
    (id: string) => {
      router.push({ pathname: '/(tabs)/conversations/chat', params: { id } });
    },
    [router],
  );

  const handleLongPress = useCallback((id: string) => {
    setSelectedId(id);
    setActionSheetOpen(true);
  }, []);

  const handlePin = useCallback((id: string) => togglePin(id), [togglePin]);
  const handleMute = useCallback((id: string) => toggleMute(id), [toggleMute]);
  const handleDelete = useCallback((id: string) => removeConversation(id), [removeConversation]);

  const selectedConv = selectedId ? conversations.find((c) => c.id === selectedId) : null;

  const actionSheetActions: ActionSheetAction[] = [
    {
      label: selectedConv?.isPinned ? t('conversations.unpin') : t('conversations.pin'),
      icon: <Text style={{ fontSize: 18 }}>📌</Text>,
    },
    {
      label: t('conversations.mute'),
      icon: <Text style={{ fontSize: 18 }}>{selectedConv?.isMuted ? '🔔' : '🔇'}</Text>,
    },
    {
      label: t('common.delete'),
      icon: <Text style={{ fontSize: 18 }}>🗑</Text>,
      destructive: true,
    },
  ];

  const handleActionSelect = useCallback(
    (index: number) => {
      if (!selectedId) return;
      switch (index) {
        case 0:
          togglePin(selectedId);
          break;
        case 1:
          toggleMute(selectedId);
          break;
        case 2:
          removeConversation(selectedId);
          break;
      }
      setSelectedId(null);
    },
    [selectedId, togglePin, toggleMute, removeConversation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationRow
        conversation={item}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPin={handlePin}
        onMute={handleMute}
        onDelete={handleDelete}
      />
    ),
    [handlePress, handleLongPress, handlePin, handleMute, handleDelete],
  );

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  return (
    <Screen>
      <Header
        title={t('conversations.title')}
        rightAction={
          <Pressable
            onPress={() =>
              router.push('/(tabs)/conversations/new-conversation')
            }
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            accessibilityLabel={t('conversations.newConversation')}
          >
            <Text color="textOnPrimary" weight="bold" style={{ fontSize: 22 }}>+</Text>
          </Pressable>
        }
      />

      <View style={[styles.searchContainer, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2] }]}>
        <SearchBar value={search} onChange={setSearch} placeholder={t('common.search')} />
      </View>

      {sortedConversations.length === 0 && !search ? (
        <EmptyState
          icon={<Text style={{ fontSize: 48 }}>💬</Text>}
          title={t('conversations.empty.title')}
          description={t('conversations.empty.subtitle')}
          action={t('conversations.newConversation')}
          onAction={() => router.push('/(tabs)/conversations/new-conversation')}
        />
      ) : (
        <FlatList
          data={sortedConversations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Weekly counter band */}
      {weeklyMessageCount > 0 && (
        <View style={[styles.weeklyBand, { backgroundColor: theme.colors.backgroundAlt, paddingVertical: theme.spacing[2] }]}>
          <Text variant="caption" color="textSoft" align="center">
            {t('chat.weeklyCounter', {
              count: weeklyMessageCount,
              cost: formatCost(weeklyEstimatedCostCents),
            })}
          </Text>
        </View>
      )}

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
  searchContainer: {},
  list: {
    flexGrow: 1,
  },
  fab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  weeklyBand: {
    paddingHorizontal: 16,
  },
});
