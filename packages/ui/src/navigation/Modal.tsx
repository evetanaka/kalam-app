import React from 'react';
import { View, Modal as RNModal, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/** Centered modal dialog with backdrop. */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const { theme: t } = useTheme();

  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: t.colors.overlay, justifyContent: 'center', alignItems: 'center', padding: t.spacing[4] }}>
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: t.colors.card,
                borderRadius: t.radius.xl,
                padding: t.spacing[6],
                width: '100%',
                maxWidth: 400,
                ...t.shadows.xl,
              }}
            >
              {title && <Text variant="h4" style={{ marginBottom: t.spacing[4] }}>{title}</Text>}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}
