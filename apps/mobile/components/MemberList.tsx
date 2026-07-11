import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Avatar, Text, Pressable, Divider } from '@kalam/ui';
import type { ConversationMember } from '@kalam/stores/src/conversationStore';

interface MemberListProps {
  members: ConversationMember[];
  onAddMember?: () => void;
}

function MemberListInner({ members, onAddMember }: MemberListProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <Text variant="label" color="textSoft" style={{ paddingHorizontal: theme.spacing[4], marginBottom: theme.spacing[2] }}>
        {t('conversationInfo.members')} · {members.length}
      </Text>

      {onAddMember && (
        <>
          <Pressable onPress={onAddMember} style={[styles.row, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]} minHitSlop={0}>
            <View style={[styles.addIcon, { backgroundColor: theme.colors.primary }]}>
              <Text color="textOnPrimary" weight="bold" style={{ fontSize: 18 }}>+</Text>
            </View>
            <Text variant="body" color="primary" weight="semibold">{t('conversationInfo.addMember')}</Text>
          </Pressable>
          <Divider />
        </>
      )}

      {members.map((m) => (
        <View key={m.id}>
          <View style={[styles.row, { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }]}>
            <Avatar size="sm" name={m.name} />
            <View style={styles.info}>
              <Text variant="body" weight="medium">{m.name}</Text>
              {m.role === 'admin' && (
                <Text variant="caption" color="primary">{t('group.admin')}</Text>
              )}
            </View>
          </View>
          <Divider />
        </View>
      ))}
    </View>
  );
}

export const MemberList = React.memo(MemberListInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
