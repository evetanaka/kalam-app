import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Avatar, Text, Pressable } from '@kalam/ui';

interface MemberPillProps {
  name: string;
  onRemove: () => void;
}

function MemberPillInner({ name, onRemove }: MemberPillProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.colors.pale, borderRadius: theme.radius.xl }]}>
      <Avatar size="xs" name={name} />
      <Text variant="caption" weight="medium" numberOfLines={1}>{name}</Text>
      <Pressable onPress={onRemove} style={styles.remove} minHitSlop={0}>
        <Text color="textSoft" style={{ fontSize: 14 }}>✕</Text>
      </Pressable>
    </View>
  );
}

export const MemberPill = React.memo(MemberPillInner);

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 44,
  },
  remove: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
