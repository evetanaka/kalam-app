import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSend: () => void;
}

export function StakeInterstitial({ visible, onClose, onSend }: Props) {
  const { theme: t } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: t.colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: t.colors.card }]}>
          {/* Shield icon */}
          <View style={styles.iconRow}>
            <View style={[styles.iconCircle, { backgroundColor: t.colors.warningLight }]}>
              <Ionicons name="shield" size={48} color={t.colors.warning} />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: t.colors.primaryDeep }]}>
            Premier contact
          </Text>

          {/* Explanation */}
          <Text style={[styles.explanation, { color: t.colors.text }]}>
            0,50 € de votre dépôt sont mis en jeu. Rendus dès que sara.kalam accepte votre message.
          </Text>

          {/* Stake detail card */}
          <View style={[styles.detailCard, { backgroundColor: t.colors.background }]}>
            <Text style={[styles.stakeLabel, { color: t.colors.warning }]}>
              Mise en jeu : 0,50 €
            </Text>
            <Text style={[styles.stakeNote, { color: t.colors.textSoft }]}>
              Rendue si accepté · brûlée si signalé
            </Text>
          </View>

          {/* Send button */}
          <Pressable style={[styles.sendButton, { backgroundColor: t.colors.green }]} onPress={onSend}>
            <Text style={[styles.sendButtonText, { color: '#FFFFFF' }]}>
              Envoyer le message
            </Text>
          </Pressable>

          {/* Cancel */}
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelText, { color: t.colors.textSoft }]}>
              Annuler
            </Text>
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
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 24,
    maxWidth: 320,
    width: '100%',
  },
  iconRow: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 16,
  },
  explanation: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  detailCard: {
    borderRadius: 6,
    padding: 16,
    marginTop: 16,
  },
  stakeLabel: {
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
  },
  stakeNote: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  sendButton: {
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  sendButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  cancelText: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
  },
});
