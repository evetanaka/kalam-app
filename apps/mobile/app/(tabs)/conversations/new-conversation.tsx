import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import {
  Screen,
  Header,
  SearchBar,
  Text,
  Pressable,
  Avatar,
  Divider,
  EmptyState,
} from '@kalam/ui';
import { useContactStore, type Contact } from '@kalam/stores/src/contactStore';
import { useConversationStore, type Conversation } from '@kalam/stores/src/conversationStore';

export default function NewConversationScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const contacts = useContactStore((s) => s.contacts);
  const conversations = useConversationStore((s) => s.conversations);
  const addConversation = useConversationStore((s) => s.addConversation);

  const [search, setSearch] = useState('');

  const filteredContacts = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.kalamName.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const handleSelectContact = useCallback(
    (contact: Contact) => {
      // Check if conversation already exists with this contact
      const existing = conversations.find(
        (c) => c.type === 'direct' && c.memberIds.includes(contact.id),
      );

      if (existing) {
        router.push({ pathname: '/(tabs)/conversations/chat', params: { id: existing.id } });
        return;
      }

      // Create new conversation
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        type: 'direct',
        name: contact.name,
        avatarUrl: contact.avatarUrl,
        lastMessage: null,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isEphemeral: false,
        memberIds: [contact.id],
        updatedAt: Date.now(),
      };

      addConversation(newConv);
      router.push({ pathname: '/(tabs)/conversations/chat', params: { id: newConv.id } });
    },
    [conversations, addConversation, router],
  );

  const renderContact = useCallback(
    ({ item }: { item: Contact }) => (
      <Pressable
        onPress={() => handleSelectContact(item)}
        style={[styles.contactRow, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}
        minHitSlop={0}
      >
        <Avatar size="md" name={item.name} />
        <View style={styles.contactInfo}>
          <Text variant="body" weight="semibold">{item.name}</Text>
          <Text variant="caption" color="textSoft">{item.kalamName}</Text>
        </View>
      </Pressable>
    ),
    [theme, handleSelectContact],
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  // Search on Kalam network section
  const isKalamSearch = search.length >= 3;

  return (
    <Screen>
      <Header
        title={t('conversations.newConversation')}
        leftAction={
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>
        }
      />

      <View style={[styles.searchContainer, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2] }]}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('contacts.searchPlaceholder')}
        />
      </View>

      {filteredContacts.length > 0 ? (
        <FlatList
          data={filteredContacts}
          renderItem={renderContact}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.list}
        />
      ) : contacts.length === 0 && !search ? (
        <EmptyState
          icon={<Text style={{ fontSize: 48 }}>👤</Text>}
          title={t('contacts.empty.title')}
          action={t('contacts.empty.findContacts')}
          onAction={() => {}}
        />
      ) : null}

      {/* Search on Kalam network */}
      {isKalamSearch && filteredContacts.length === 0 && (
        <View style={[styles.networkSection, { paddingHorizontal: theme.spacing[4] }]}>
          <Text variant="label" color="textSoft" style={{ marginBottom: theme.spacing[2] }}>
            {t('contacts.networkResult')}
          </Text>
          <Pressable
            onPress={() => {
              // Create conversation with searched .kalam name
              const kalamName = search.endsWith('.kalam') ? search : `${search}.kalam`;
              const newConv: Conversation = {
                id: `conv-${Date.now()}`,
                type: 'direct',
                name: kalamName,
                avatarUrl: null,
                lastMessage: null,
                unreadCount: 0,
                isPinned: false,
                isMuted: false,
                isEphemeral: false,
                memberIds: [kalamName],
                updatedAt: Date.now(),
              };
              addConversation(newConv);
              router.push({ pathname: '/(tabs)/conversations/chat', params: { id: newConv.id } });
            }}
            style={[styles.contactRow, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}
            minHitSlop={0}
          >
            <Avatar size="md" name={search} />
            <View style={styles.contactInfo}>
              <Text variant="body" weight="semibold">
                {search.endsWith('.kalam') ? search : `${search}.kalam`}
              </Text>
              <Text variant="caption" color="textSoft">
                {t('contacts.networkResult')}
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {},
  list: {
    flexGrow: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
    minWidth: 44,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  networkSection: {
    marginTop: 16,
  },
});
