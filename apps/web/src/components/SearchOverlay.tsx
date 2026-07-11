import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { SearchBar, Text } from '@kalam/ui';
import type { Message } from '@kalam/stores';

interface SearchOverlayProps {
  messages: Message[];
  onClose: () => void;
  onNavigate: (messageId: string) => void;
}

export function SearchOverlay({ messages, onClose, onNavigate }: SearchOverlayProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const matches = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return messages.filter((m) => m.text.toLowerCase().includes(q));
  }, [messages, query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handlePrev = useCallback(() => {
    if (matches.length === 0) return;
    const next = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(next);
    onNavigate(matches[next].id);
  }, [currentIndex, matches, onNavigate]);

  const handleNext = useCallback(() => {
    if (matches.length === 0) return;
    const next = (currentIndex + 1) % matches.length;
    setCurrentIndex(next);
    onNavigate(matches[next].id);
  }, [currentIndex, matches, onNavigate]);

  return (
    <div style={{
      borderBottom: `0.5px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.background,
      padding: '8px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <SearchBar
            value={query}
            onChange={(val) => { setQuery(val); setCurrentIndex(0); }}
            placeholder={t('searchChat.placeholder')}
          />
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, color: theme.colors.textSoft,
            minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>
      </div>
      {query.length >= 2 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Text variant="caption" color="textSoft">
            {matches.length > 0
              ? t('chat.searchResults', { current: currentIndex + 1, total: matches.length })
              : t('searchChat.noResults')}
          </Text>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={handlePrev} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, minWidth: 44, minHeight: 44 }}>▲</button>
            <button onClick={handleNext} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, minWidth: 44, minHeight: 44 }}>▼</button>
          </div>
        </div>
      )}
    </div>
  );
}
