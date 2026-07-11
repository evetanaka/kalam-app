import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Text } from '@kalam/ui';
import { useConversationStore, type EphemeralDuration } from '@kalam/stores';

const OPTIONS: { key: EphemeralDuration; labelKey: string; descKey: string }[] = [
  { key: 'off', labelKey: 'ephemeral.disabled', descKey: 'ephemeral.disabledDesc' },
  { key: '5m', labelKey: 'ephemeral.5m', descKey: 'ephemeral.5mDesc' },
  { key: '1h', labelKey: 'ephemeral.1h', descKey: 'ephemeral.1hDesc' },
  { key: '1d', labelKey: 'ephemeral.1d', descKey: 'ephemeral.1dDesc' },
  { key: '1w', labelKey: 'ephemeral.1w', descKey: 'ephemeral.1wDesc' },
];

export function EphemeralConfigPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const conversationId = id ?? '';

  const conversations = useConversationStore((s) => s.conversations);
  const conversation = conversations.find((c) => c.id === conversationId);
  const updateConversation = useConversationStore((s) => s.updateConversation);

  const currentPreset = conversation?.ephemeralPreset ?? 'off';

  const handleSelect = useCallback((preset: EphemeralDuration) => {
    updateConversation(conversationId, { isEphemeral: preset !== 'off', ephemeralPreset: preset });
    navigate(-1);
  }, [conversationId, updateConversation, navigate]);

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '0.5px solid var(--hair)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, minWidth: 44, minHeight: 44 }}>←</button>
        <span style={{ fontWeight: 600, fontSize: 16, marginLeft: 8 }}>{t('ephemeral.title')}</span>
      </div>

      <div style={{ padding: `${theme.spacing[3]}px ${theme.spacing[4]}px` }}>
        <Text variant="caption" color="textSoft">{t('ephemeral.explanation')}</Text>
      </div>

      {OPTIONS.map((opt) => (
        <div
          key={opt.key}
          onClick={() => handleSelect(opt.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: `${theme.spacing[3]}px ${theme.spacing[4]}px`,
            cursor: 'pointer', minHeight: 44,
            borderBottom: `0.5px solid ${theme.colors.border}`,
          }}
        >
          <span style={{ fontSize: 18 }}>⏱</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: currentPreset === opt.key ? 700 : 400 }}>{t(opt.labelKey)}</div>
            <div style={{ fontSize: 12, color: theme.colors.textSoft }}>{t(opt.descKey)}</div>
          </div>
          {currentPreset === opt.key && <span style={{ color: theme.colors.primary, fontSize: 18 }}>✓</span>}
        </div>
      ))}
    </div>
  );
}
