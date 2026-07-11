import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
}

export function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = 'Révoquer cet appareil ?',
  message = "Cet appareil n'aura plus accès à vos conversations.",
  confirmLabel = 'Révoquer',
}: Props) {
  const { theme: t } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: t.colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: t.colors.card }]}>
          <Text style={[styles.title, { color: t.colors.primaryDeep }]}>{title}</Text>
          <Text style={[styles.message, { color: t.colors.text }]}>{message}</Text>

          <Pressable style={[styles.destructiveButton, { backgroundColor: t.colors.danger }]} onPress={onConfirm}>
            <Text style={[styles.destructiveText, { color: '#FFFFFF' }]}>{confirmLabel}</Text>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelText, { color: t.colors.textSoft }]}>Annuler</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 20,
    maxWidth: 300,
    width: '85%',
  },
  title: {
    fontWeight: '700',
    fontSize: 17,
  },
  message: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  destructiveButton: {
    width: '100%',
    height: 52,
    marginTop: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveText: {
    fontWeight: '600',
    fontSize: 15,
  },
  cancelButton: {
    width: '100%',
    height: 44,
    marginTop: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
