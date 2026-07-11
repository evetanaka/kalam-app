import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { BottomSheet } from './BottomSheet';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Divider } from '../primitives/Divider';

export interface ActionSheetAction {
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
}

export interface ActionSheetProps {
  actions: ActionSheetAction[];
  onSelect: (index: number) => void;
  onCancel: () => void;
  open: boolean;
}

/** Bottom action sheet with a list of actions. */
export function ActionSheet({ actions, onSelect, onCancel, open }: ActionSheetProps) {
  const { theme: t } = useTheme();

  return (
    <BottomSheet open={open} onClose={onCancel} height={Math.min(0.6, 0.08 * actions.length + 0.15)}>
      <View style={{ gap: 0 }}>
        {actions.map((action, i) => (
          <React.Fragment key={i}>
            <Pressable
              onPress={() => { onSelect(i); onCancel(); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: t.spacing[4],
                paddingHorizontal: t.spacing[4],
                gap: t.spacing[3],
              }}
              accessibilityRole="menuitem"
              accessibilityLabel={action.label}
            >
              {action.icon}
              <Text
                variant="body"
                color={action.destructive ? 'danger' : 'text'}
                weight="medium"
              >
                {action.label}
              </Text>
            </Pressable>
            {i < actions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </View>
    </BottomSheet>
  );
}
