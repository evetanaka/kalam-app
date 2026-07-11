import React, { useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import {
  Screen,
  Header,
  Text,
  Pressable,
  Avatar,
  SecurityBadge,
  Toggle,
  Divider,
} from '@kalam/ui';
import { useConversationStore } from '@kalam/stores/src/conversationStore';
import { MemberList } from '../../../components/MemberList';

const EPHEMERAL_LABELS: Record<string, string> = {
  off: 'ephemeral.disabled',
  '5m': 'ephemeral.5m',
  '1h': 'ephemeral.1h',
  '1d': 'ephemeral.1d',
  '1w': 'ephemeral.1w',
};

export default function ConversationInfoScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const conversationId = id ?? '';
  const isGroup = type === 'group';

  const conversations = useConversationStore((s) => s.conversations);
  const conversation = conversations.find((c) => c.id === conversationId);
  const toggleMute = useConversationStore((s) => s.toggleMute);
  const updateConversation = useConversationStore((s) => s.updateConversation);

  const ephemeralPreset = conversation?.ephemeralPreset ?? 'off';

  const handleToggleMute = useCallback(() => {
    if (conversationId) toggleMute(conversationId);
  }, [conversationId, toggleMute]);

  const handleToggleEphemeral = useCallback(() => {
    if (!conversationId) return;
    if (conversation?.isEphemeral) {
      updateConversation(conversationId, { isEphemeral: false, ephemeralPreset: 'off' });
    } else {
      router.push({ pathname: '/(tabs)/conversations/ephemeral-config', params: { id: conversationId } });
    }
  }, [conversationId, conversation, updateConversation, router]);

  if (!conversation) return null;

  const members = conversation.members ?? [];

  return (
    <Screen>
      <Header
        title={t('conversationInfo.title')}
        leftAction={
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          {isGroup && members.length > 0 ? (
            <View style={styles.groupAvatarGrid}>
              {members.slice(0, 4).map((m) => (
                <Avatar key={m.id} size="md" name={m.name} />
              ))}
            </View>
          ) : (
            <Avatar size="lg" name={conversation.name} />
          )}
          <Text variant="body" weight="bold" style={{ marginTop: theme.spacing[3], fontSize: 20 }}>
            {conversation.name}
          </Text>
          {isGroup && (
            <Text variant="caption" color="textSoft">
              {t('chat.members', { count: members.length })}
            </Text>
          )}
        </View>

        {/* E2E badge */}
        <View style={[styles.section, { paddingHorizontal: theme.spacing[4] }]}>
          <SecurityBadge verified />
          <Text variant="caption" color="textSoft" style={{ marginLeft: 8 }}>
            {t('conversationInfo.e2e')}
          </Text>
        </View>

        <Divider />

        {/* Media section */}
        <Pressable
          onPress={() => {}}
          style={[styles.row, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}
          minHitSlop={0}
        >
          <Text style={{ fontSize: 18 }}>🖼</Text>
          <View style={styles.rowContent}>
            <Text variant="body">{t('conversationInfo.media')}</Text>
            <Text variant="caption" color="textSoft">{t('conversationInfo.mediaCount', { count: 0 })}</Text>
          </View>
          <Text color="textSoft">›</Text>
        </Pressable>

        <Divider />

        {/* Ephemeral messages */}
        <View style={[styles.row, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}>
          <Text style={{ fontSize: 18 }}>⏱</Text>
          <Pressable
            onPress={() => router.push({ pathname: '/(tabs)/conversations/ephemeral-config', params: { id: conversationId } })}
            style={styles.rowContent}
            minHitSlop={0}
          >
            <Text variant="body">{t('conversationInfo.ephemeralMessages')}</Text>
            <Text variant="caption" color="textSoft">{t(EPHEMERAL_LABELS[ephemeralPreset] || 'ephemeral.disabled')}</Text>
          </Pressable>
          <Toggle value={conversation.isEphemeral} onValueChange={handleToggleEphemeral} />
        </View>

        <Divider />

        {/* Notifications */}
        <View style={[styles.row, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}>
          <Text style={{ fontSize: 18 }}>{conversation.isMuted ? '🔇' : '🔔'}</Text>
          <View style={styles.rowContent}>
            <Text variant="body">{t('conversationInfo.notifications')}</Text>
          </View>
          <Toggle value={!conversation.isMuted} onValueChange={handleToggleMute} />
        </View>

        <Divider />

        {/* Group members */}
        {isGroup && (
          <>
            <View style={{ marginTop: theme.spacing[4] }}>
              <MemberList
                members={members}
                onAddMember={() => router.push({ pathname: '/(tabs)/conversations/create-group', params: { addToGroup: conversationId } })}
              />
            </View>
            <Divider />
          </>
        )}

        {/* Danger zone */}
        <View style={{ marginTop: theme.spacing[4] }}>
          {isGroup ? (
            <Pressable
              onPress={() => {}}
              style={[styles.dangerRow, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}
              minHitSlop={0}
            >
              <Text color="danger" weight="semibold">{t('conversationInfo.leaveGroup')}</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={() => {}}
                style={[styles.dangerRow, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}
                minHitSlop={0}
              >
                <Text color="danger" weight="semibold">{t('conversationInfo.block')}</Text>
              </Pressable>
              <Pressable
                onPress={() => {}}
                style={[styles.dangerRow, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}
                minHitSlop={0}
              >
                <Text color="danger" weight="semibold">{t('conversationInfo.report')}</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  groupAvatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 88,
    gap: 4,
    justifyContent: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
  },
  rowContent: {
    flex: 1,
    gap: 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  dangerRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
