import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { SearchBar, Text, Avatar, Divider, EmptyState } from '@kalam/ui';
import { useContactStore, type Contact } from '@kalam/stores/src/contactStore';
import { useConversationStore, type Conversation } from '@kalam/stores/src/conversationStore';

export function NewConversationPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const contacts = useContactStore((s) => s.contacts);
  const conversations = useConversationStore((s) => s.conversations);
  const addConversation = useConversationStore((s) => s.addConversation);

  const [search, setSearch] = useState('');

  const filteredContacts = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter((c) => c.name.toLowerCase().includes(q) || c.kalamName.toLowerCase().includes(q));
  }, [contacts, search]);

  const handleSelectContact = useCallback((contact: Contact) => {
    const existing = conversations.find((c) => c.type === 'direct' && c.memberIds.includes(contact.id));
    if (existing) { navigate(`/chat/${existing.id}`); return; }

    const newConv: Conversation = {
      id: `conv-${Date.now()}`, type: 'direct', name: contact.name, avatarUrl: contact.avatarUrl,
      lastMessage: null, unreadCount: 0, isPinned: false, isMuted: false, isEphemeral: false,
      memberIds: [contact.id], updatedAt: Date.now(),
    };
    addConversation(newConv);
    navigate(`/chat/${newConv.id}`);
  }, [conversations, addConversation, navigate]);

  const handleNetworkSelect = useCallback(() => {
    const kalamName = search.endsWith('.kalam') ? search : `${search}.kalam`;
    const newConv: Conversation = {
      id: `conv-${Date.now()}`, type: 'direct', name: kalamName, avatarUrl: null,
      lastMessage: null, unreadCount: 0, isPinned: false, isMuted: false, isEphemeral: false,
      memberIds: [kalamName], updatedAt: Date.now(),
    };
    addConversation(newConv);
    navigate(`/chat/${newConv.id}`);
  }, [search, addConversation, navigate]);

  const isKalamSearch = search.length >= 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        height: 56, padding: '0 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '0.5px solid var(--hair)', backgroundColor: 'white',
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 20,
        }}>←</button>
        <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>
          {t('conversations.newConversation')}
        </span>
      </div>

      <div style={{ padding: `${theme.spacing[2]}px ${theme.spacing[4]}px` }}>
        <SearchBar value={search} onChange={setSearch} placeholder={t('contacts.searchPlaceholder')} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact, i) => (
            <React.Fragment key={contact.id}>
              <div
                onClick={() => handleSelectContact(contact)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  padding: `${theme.spacing[3]}px ${theme.spacing[4]}px`,
                  minHeight: 44,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
              >
                <Avatar size="md" name={contact.name} />
                <div style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold">{contact.name}</Text>
                  <Text variant="caption" color="textSoft">{contact.kalamName}</Text>
                </div>
              </div>
              {i < filteredContacts.length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : contacts.length === 0 && !search ? (
          <EmptyState
            icon={<span style={{ fontSize: 48 }}>👤</span>}
            title={t('contacts.empty.title')}
            action={t('contacts.empty.findContacts')}
            onAction={() => {}}
          />
        ) : null}

        {isKalamSearch && filteredContacts.length === 0 && (
          <div style={{ padding: `0 ${theme.spacing[4]}px`, marginTop: 16 }}>
            <Text variant="label" color="textSoft" style={{ marginBottom: theme.spacing[2] }}>
              {t('contacts.networkResult')}
            </Text>
            <div
              onClick={handleNetworkSelect}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                padding: `${theme.spacing[3]}px ${theme.spacing[4]}px`, minHeight: 44,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
            >
              <Avatar size="md" name={search} />
              <div style={{ flex: 1 }}>
                <Text variant="body" weight="semibold">{search.endsWith('.kalam') ? search : `${search}.kalam`}</Text>
                <Text variant="caption" color="textSoft">{t('contacts.networkResult')}</Text>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
