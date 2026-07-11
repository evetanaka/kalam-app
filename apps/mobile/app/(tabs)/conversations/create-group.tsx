import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, ScrollView, StyleSheet } from 'react-native';
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
  Input,
} from '@kalam/ui';
import { useContactStore, type Contact } from '@kalam/stores/src/contactStore';
import { useConversationStore, type Conversation } from '@kalam/stores/src/conversationStore';
import { MemberPill } from '../../../components/MemberPill';

export default function CreateGroupScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const contacts = useContactStore((s) => s.contacts);
  const addConversation = useConversationStore((s) => s.addConversation);

  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState('');

  const filteredContacts = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter((c) => c.name.toLowerCase().includes(q) || c.kalamName.toLowerCase().includes(q));
  }, [contacts, search]);

  const selectedContacts = useMemo(
    () => contacts.filter((c) => selectedIds.has(c.id)),
    [contacts, selectedIds],
  );

  const toggleContact = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCreate = useCallback(() => {
    if (!groupName.trim() || selectedContacts.length < 2) return;

    const newConv: Conversation = {
      id: `conv-group-${Date.now()}`,
      type: 'group',
      name: groupName.trim(),
      avatarUrl: null,
      lastMessage: null,
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isEphemeral: false,
      memberIds: ['me', ...selectedContacts.map((c) => c.id)],
      members: [
        { id: 'me', name: 'Vous', role: 'admin' },
        ...selectedContacts.map((c) => ({ id: c.id, name: c.name, role: 'member' as const })),
      ],
      updatedAt: Date.now(),
    };

    addConversation(newConv);
    router.push({ pathname: '/(tabs)/conversations/group-chat', params: { id: newConv.id } });
  }, [groupName, selectedContacts, addConversation, router]);

  const renderContact = useCallback(
    ({ item }: { item: Contact }) => {
      const isSelected = selectedIds.has(item.id);
      return (
        <Pressable
          onPress={() => toggleContact(item.id)}
          style={[styles.contactRow, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}
          minHitSlop={0}
        >
          <Avatar size="md" name={item.name} />
          <View style={styles.contactInfo}>
            <Text variant="body" weight="semibold">{item.name}</Text>
            <Text variant="caption" color="textSoft">{item.kalamName}</Text>
          </View>
          <View style={[styles.checkbox, {
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            backgroundColor: isSelected ? theme.colors.primary : 'transparent',
          }]}>
            {isSelected && <Text color="textOnPrimary" style={{ fontSize: 12 }}>✓</Text>}
          </View>
        </Pressable>
      );
    },
    [theme, selectedIds, toggleContact],
  );

  if (step === 2) {
    return (
      <Screen>
        <Header
          title={t('group.details')}
          leftAction={
            <Pressable onPress={() => setStep(1)} accessibilityLabel={t('common.back')}>
              <Text style={{ fontSize: 20 }}>←</Text>
            </Pressable>
          }
        />
        <View style={[styles.step2, { paddingHorizontal: theme.spacing[4] }]}>
          <View style={styles.groupAvatarPreview}>
            {selectedContacts.slice(0, 4).map((c) => (
              <Avatar key={c.id} size="md" name={c.name} />
            ))}
          </View>

          <Input
            value={groupName}
            onChangeText={setGroupName}
            placeholder={t('group.groupName')}
          />

          <Pressable
            onPress={handleCreate}
            disabled={!groupName.trim() || selectedContacts.length < 2}
            style={[styles.createBtn, {
              backgroundColor: groupName.trim() && selectedContacts.length >= 2 ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.radius.xl,
            }]}
            minHitSlop={0}
          >
            <Text color="textOnPrimary" weight="bold">{t('group.create')}</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title={t('group.selectMembers')}
        leftAction={
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>
        }
        rightAction={
          selectedIds.size >= 2 ? (
            <Pressable onPress={() => setStep(2)} accessibilityLabel={t('common.next')}>
              <Text color="primary" weight="bold">{t('common.next')}</Text>
            </Pressable>
          ) : undefined
        }
      />

      {/* Selected pills */}
      {selectedContacts.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={styles.pillContainer}>
          {selectedContacts.map((c) => (
            <MemberPill key={c.id} name={c.name} onRemove={() => toggleContact(c.id)} />
          ))}
        </ScrollView>
      )}

      <View style={[styles.searchContainer, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2] }]}>
        <SearchBar value={search} onChange={setSearch} placeholder={t('contacts.searchPlaceholder')} />
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {},
  list: { flexGrow: 1 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
  },
  contactInfo: { flex: 1, gap: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillScroll: {
    maxHeight: 56,
  },
  pillContainer: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  step2: {
    paddingTop: 24,
    gap: 24,
    alignItems: 'center',
  },
  groupAvatarPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 100,
    gap: 4,
    justifyContent: 'center',
  },
  createBtn: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
