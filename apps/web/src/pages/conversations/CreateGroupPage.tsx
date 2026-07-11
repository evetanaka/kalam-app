import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { SearchBar, Avatar, Text } from '@kalam/ui';
import { useContactStore, useConversationStore, type Conversation, type Contact } from '@kalam/stores';
import { MemberPill } from '../../components/MemberPill';

export function CreateGroupPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const selectedContacts = useMemo(() => contacts.filter((c) => selectedIds.has(c.id)), [contacts, selectedIds]);

  const toggleContact = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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
    navigate(`/group-chat/${newConv.id}`);
  }, [groupName, selectedContacts, addConversation, navigate]);

  if (step === 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '0.5px solid var(--hair)' }}>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, minWidth: 44, minHeight: 44 }}>←</button>
          <span style={{ fontWeight: 600, fontSize: 16, marginLeft: 8 }}>{t('group.details')}</span>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', width: 100, gap: 4, justifyContent: 'center' }}>
            {selectedContacts.slice(0, 4).map((c) => <Avatar key={c.id} size="md" name={c.name} />)}
          </div>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t('group.groupName')}
            style={{
              width: '100%', maxWidth: 400, height: 44, borderRadius: theme.radius.xl,
              border: `1px solid ${theme.colors.border}`, padding: '0 16px',
              fontSize: 15, outline: 'none', fontFamily: theme.typography.fontFamily.body,
            }}
          />
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedContacts.length < 2}
            style={{
              width: '100%', maxWidth: 400, height: 48, borderRadius: theme.radius.xl,
              backgroundColor: groupName.trim() && selectedContacts.length >= 2 ? theme.colors.primary : theme.colors.border,
              border: 'none', cursor: 'pointer', color: 'white', fontWeight: 'bold', fontSize: 15,
            }}
          >{t('group.create')}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '0.5px solid var(--hair)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, minWidth: 44, minHeight: 44 }}>←</button>
          <span style={{ fontWeight: 600, fontSize: 16, marginLeft: 8 }}>{t('group.selectMembers')}</span>
        </div>
        {selectedIds.size >= 2 && (
          <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.primary, fontWeight: 'bold', fontSize: 15, minHeight: 44 }}>
            {t('common.next')}
          </button>
        )}
      </div>

      {selectedContacts.length > 0 && (
        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', overflowX: 'auto' }}>
          {selectedContacts.map((c) => <MemberPill key={c.id} name={c.name} onRemove={() => toggleContact(c.id)} />)}
        </div>
      )}

      <div style={{ padding: '8px 12px' }}>
        <SearchBar value={search} onChange={setSearch} placeholder={t('contacts.searchPlaceholder')} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredContacts.map((c) => {
          const isSelected = selectedIds.has(c.id);
          return (
            <div
              key={c.id}
              onClick={() => toggleContact(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: `${theme.spacing[3]}px ${theme.spacing[4]}px`,
                cursor: 'pointer', minHeight: 44,
                borderBottom: `0.5px solid ${theme.colors.border}`,
              }}
            >
              <Avatar size="md" name={c.name} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: theme.colors.text }}>{c.name}</div>
                <div style={{ fontSize: 12, color: theme.colors.textSoft }}>{c.kalamName}</div>
              </div>
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
