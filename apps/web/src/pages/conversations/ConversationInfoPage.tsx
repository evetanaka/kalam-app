import React, { useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Avatar, SecurityBadge, Toggle, Text } from '@kalam/ui';
import { useConversationStore, type EphemeralDuration } from '@kalam/stores';

const EPHEMERAL_LABELS: Record<string, string> = {
  off: 'ephemeral.disabled',
  '5m': 'ephemeral.5m',
  '1h': 'ephemeral.1h',
  '1d': 'ephemeral.1d',
  '1w': 'ephemeral.1w',
};

export function ConversationInfoPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') ?? 'direct';
  const isGroup = type === 'group';
  const conversationId = id ?? '';

  const conversations = useConversationStore((s) => s.conversations);
  const conversation = conversations.find((c) => c.id === conversationId);
  const toggleMute = useConversationStore((s) => s.toggleMute);
  const updateConversation = useConversationStore((s) => s.updateConversation);

  if (!conversation) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--soft)' }}>Not found</div>;

  const members = conversation.members ?? [];
  const ephemeralPreset = conversation.ephemeralPreset ?? 'off';

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: `${theme.spacing[3]}px ${theme.spacing[4]}px`,
    minHeight: 44, cursor: 'pointer',
  };
  const divider: React.CSSProperties = { height: 0.5, backgroundColor: theme.colors.border };

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '0.5px solid var(--hair)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, minWidth: 44, minHeight: 44 }}>←</button>
        <span style={{ fontWeight: 600, fontSize: 16, marginLeft: 8 }}>{t('conversationInfo.title')}</span>
      </div>

      {/* Avatar */}
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        {isGroup && members.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', width: 88, gap: 4, justifyContent: 'center', margin: '0 auto' }}>
            {members.slice(0, 4).map((m) => <Avatar key={m.id} size="md" name={m.name} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}><Avatar size="lg" name={conversation.name} /></div>
        )}
        <div style={{ marginTop: 12, fontWeight: 700, fontSize: 20, color: theme.colors.text }}>{conversation.name}</div>
        {isGroup && <div style={{ fontSize: 13, color: theme.colors.textSoft }}>{t('chat.members', { count: members.length })}</div>}
      </div>

      {/* E2E */}
      <div style={{ ...rowStyle, cursor: 'default' }}>
        <SecurityBadge verified />
        <span style={{ fontSize: 13, color: theme.colors.textSoft }}>{t('conversationInfo.e2e')}</span>
      </div>
      <div style={divider} />

      {/* Media */}
      <div style={rowStyle}>
        <span style={{ fontSize: 18 }}>🖼</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>{t('conversationInfo.media')}</div>
          <div style={{ fontSize: 12, color: theme.colors.textSoft }}>{t('conversationInfo.mediaCount', { count: 0 })}</div>
        </div>
        <span style={{ color: theme.colors.textSoft }}>›</span>
      </div>
      <div style={divider} />

      {/* Ephemeral */}
      <div style={rowStyle} onClick={() => navigate(`/ephemeral/${conversationId}`)}>
        <span style={{ fontSize: 18 }}>⏱</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>{t('conversationInfo.ephemeralMessages')}</div>
          <div style={{ fontSize: 12, color: theme.colors.textSoft }}>{t(EPHEMERAL_LABELS[ephemeralPreset] || 'ephemeral.disabled')}</div>
        </div>
        <Toggle value={conversation.isEphemeral} onValueChange={() => {
          if (conversation.isEphemeral) updateConversation(conversationId, { isEphemeral: false, ephemeralPreset: 'off' });
          else navigate(`/ephemeral/${conversationId}`);
        }} />
      </div>
      <div style={divider} />

      {/* Notifications */}
      <div style={{ ...rowStyle, cursor: 'default' }}>
        <span style={{ fontSize: 18 }}>{conversation.isMuted ? '🔇' : '🔔'}</span>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 500 }}>{t('conversationInfo.notifications')}</div></div>
        <Toggle value={!conversation.isMuted} onValueChange={() => toggleMute(conversationId)} />
      </div>
      <div style={divider} />

      {/* Group members */}
      {isGroup && (
        <>
          <div style={{ padding: `${theme.spacing[3]}px ${theme.spacing[4]}px` }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: theme.colors.textSoft, marginBottom: 8 }}>
              {t('conversationInfo.members')} · {members.length}
            </div>
            <div style={rowStyle} onClick={() => navigate(`/create-group?addToGroup=${conversationId}`)}>
              <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 18 }}>+</div>
              <span style={{ color: theme.colors.primary, fontWeight: 600 }}>{t('conversationInfo.addMember')}</span>
            </div>
            {members.map((m) => (
              <div key={m.id} style={{ ...rowStyle, borderTop: `0.5px solid ${theme.colors.border}` }}>
                <Avatar size="sm" name={m.name} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500 }}>{m.name}</span>
                  {m.role === 'admin' && <span style={{ marginLeft: 8, fontSize: 12, color: theme.colors.primary }}>{t('group.admin')}</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={divider} />
        </>
      )}

      {/* Danger zone */}
      <div style={{ padding: `${theme.spacing[4]}px` }}>
        {isGroup ? (
          <button style={{ background: 'none', border: 'none', color: theme.colors.danger, fontWeight: 600, fontSize: 15, cursor: 'pointer', minHeight: 44 }}>
            {t('conversationInfo.leaveGroup')}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{ background: 'none', border: 'none', color: theme.colors.danger, fontWeight: 600, fontSize: 15, cursor: 'pointer', minHeight: 44, textAlign: 'left' }}>
              {t('conversationInfo.block')}
            </button>
            <button style={{ background: 'none', border: 'none', color: theme.colors.danger, fontWeight: 600, fontSize: 15, cursor: 'pointer', minHeight: 44, textAlign: 'left' }}>
              {t('conversationInfo.report')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
