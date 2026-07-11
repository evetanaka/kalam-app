import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { SearchBar, Pressable, Text } from '@kalam/ui';
import type { Message } from '@kalam/stores/src/messageStore';

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
    <View style={[styles.container, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <View style={styles.row}>
        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChange={(val) => { setQuery(val); setCurrentIndex(0); }}
            placeholder={t('searchChat.placeholder')}
          />
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} minHitSlop={0}>
          <Text style={{ fontSize: 18 }}>✕</Text>
        </Pressable>
      </View>
      {query.length >= 2 && (
        <View style={styles.navRow}>
          <Text variant="caption" color="textSoft">
            {matches.length > 0
              ? t('chat.searchResults', { current: currentIndex + 1, total: matches.length })
              : t('searchChat.noResults')}
          </Text>
          <View style={styles.arrows}>
            <Pressable onPress={handlePrev} style={styles.arrowBtn} minHitSlop={0}>
              <Text style={{ fontSize: 16 }}>▲</Text>
            </Pressable>
            <Pressable onPress={handleNext} style={styles.arrowBtn} minHitSlop={0}>
              <Text style={{ fontSize: 16 }}>▼</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchWrap: {
    flex: 1,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  arrows: {
    flexDirection: 'row',
    gap: 4,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});
