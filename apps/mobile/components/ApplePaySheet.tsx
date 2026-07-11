import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPay: () => void;
}

export function ApplePaySheet({ visible, onClose, onPay }: Props) {
  const { theme: t } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* Header bar */}
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <Text style={styles.cancelLink}>Annuler</Text>
            </Pressable>
            <View style={styles.headerTitle}>
              <Ionicons name="logo-apple" size={20} color="#000" />
              <Text style={styles.headerTitleText}>Pay</Text>
            </View>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.body}>
            {/* Amount section */}
            <View style={styles.amountCard}>
              <View style={styles.amountRow}>
                <View>
                  <Text style={styles.merchantLabel}>KALAM / IKIGAI INTL</Text>
                  <Text style={styles.merchantDesc}>Dépôt de garantie</Text>
                </View>
                <Text style={styles.amountValue}>10,00 €</Text>
              </View>
            </View>

            {/* Card selection */}
            <View style={styles.cardRow}>
              <View style={styles.cardIcon} />
              <Text style={styles.cardLabel}>Visa •••• 4829</Text>
              <Text style={styles.cardChevron}>›</Text>
            </View>

            {/* Pay button */}
            <Pressable style={styles.payButton} onPress={onPay}>
              <Text style={styles.payButtonText}>Payer avec </Text>
              <Ionicons name="logo-apple" size={20} color="#fff" />
              <Text style={styles.payButtonText}> Pay</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6',
  },
  cancelLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitleText: {
    fontWeight: '700',
    fontSize: 17,
    color: '#000',
  },
  body: {
    padding: 20,
  },
  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchantLabel: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 17,
    color: '#8E8E93',
  },
  merchantDesc: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#000',
    marginTop: 4,
  },
  amountValue: {
    fontWeight: '700',
    fontSize: 28,
    color: '#000',
  },
  cardRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 26,
    backgroundColor: '#1A1A2E',
    borderRadius: 4,
  },
  cardLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: '#000',
  },
  cardChevron: {
    fontSize: 16,
    color: '#8E8E93',
  },
  payButton: {
    height: 52,
    marginTop: 16,
    backgroundColor: '#000',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    fontWeight: '600',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
