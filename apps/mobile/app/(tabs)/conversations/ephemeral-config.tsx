import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Screen, Header, Text, Pressable, Divider } from '@kalam/ui';
import { useConversationStore, type EphemeralDuration } from '@kalam/stores/src/conversationStore';

const OPTIONS: { key: EphemeralDuration; labelKey: string; descKey: string }[] = [
  { key: 'off', labelKey: 'ephemeral.disabled', descKey: 'ephemeral.disabledDesc' },
  { key: '5m', labelKey: 'ephemeral.5m', descKey: 'ephemeral.5mDesc' },
  { key: '1h', labelKey: 'ephemeral.1h', descKey: 'ephemeral.1hDesc' },
  { key: '1d', labelKey: 'ephemeral.1d', descKey: 'ephemeral.1dDesc' },
  { key: '1w', labelKey: 'ephemeral.1w', descKey: 'ephemeral.1wDesc' },
];

export default function EphemeralConfigScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id ?? '';

  const conversations = useConversationStore((s) => s.conversations);
  const conversation = conversations.find((c) => c.id === conversationId);
  const updateConversation = useConversationStore((s) => s.updateConversation);

  const currentPreset = conversation?.ephemeralPreset ?? 'off';

  const handleSelect = useCallback(
    (preset: EphemeralDuration) => {
      updateConversation(conversationId, {
        isEphemeral: preset !== 'off',
        ephemeralPreset: preset,
      });
      router.back();
    },
    [conversationId, updateConversation, router],
  );

  return (
    <Screen>
      <Header
        title={t('ephemeral.title')}
        leftAction={
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>
        }
      />

      <View style={[styles.explanation, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}>
        <Text variant="caption" color="textSoft">{t('ephemeral.explanation')}</Text>
      </View>

      {OPTIONS.map((opt) => (
        <View key={opt.key}>
          <Pressable
            onPress={() => handleSelect(opt.key)}
            style={[styles.option, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}
            minHitSlop={0}
          >
            <Text style={{ fontSize: 18, marginRight: 12 }}>⏱</Text>
            <View style={styles.optionContent}>
              <Text variant="body" weight={currentPreset === opt.key ? 'bold' : 'regular'}>
                {t(opt.labelKey)}
              </Text>
              <Text variant="caption" color="textSoft">{t(opt.descKey)}</Text>
            </View>
            {currentPreset === opt.key && (
              <Text color="primary" style={{ fontSize: 18 }}>✓</Text>
            )}
          </Pressable>
          <Divider />
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  explanation: {},
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  optionContent: {
    flex: 1,
    gap: 2,
  },
});
