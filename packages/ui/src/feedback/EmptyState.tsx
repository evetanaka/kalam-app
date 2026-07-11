import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';

export interface EmptyStateProps {
  /** Icon element */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** CTA button label */
  action?: string;
  onAction?: () => void;
}

/** Empty state with illustration, title, description, and CTA. */
export function EmptyState({ icon, title, description, action, onAction }: EmptyStateProps) {
  const { theme: t } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: t.spacing[8],
        gap: t.spacing[3],
      }}
    >
      {icon}
      <Text variant="h4" align="center">{title}</Text>
      {description && (
        <Text variant="body" color="textSoft" align="center">{description}</Text>
      )}
      {action && onAction && (
        <Pressable
          onPress={onAction}
          style={{
            backgroundColor: t.colors.primary,
            borderRadius: t.radius.full,
            paddingHorizontal: t.spacing[6],
            paddingVertical: t.spacing[3],
            marginTop: t.spacing[2],
          }}
          accessibilityLabel={action}
        >
          <Text color="textOnPrimary" weight="semibold">{action}</Text>
        </Pressable>
      )}
    </View>
  );
}
