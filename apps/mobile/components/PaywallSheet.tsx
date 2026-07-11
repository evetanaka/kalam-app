import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const benefits = [
  'Groupes jusqu\'à 1 000 membres',
  '5 comptes/alias',
  'Communautés à accès payant',
  'Gains de parrainage doublés',
];

export function PaywallSheet({ visible, onClose, onSubscribe }: Props) {
  const { theme: t } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: t.colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: t.colors.card }]} onPress={() => {}}>
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: t.colors.border }]} />
          </View>

          {/* Badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: t.colors.warningLight }]}>
              <Text style={[styles.badgeText, { color: t.colors.warning }]}>KALAM+</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: t.colors.primaryDeep }]}>
            Groupes jusqu'à 1 000 membres
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsList}>
            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Ionicons name="checkmark" size={16} color={t.colors.green} />
                <Text style={[styles.benefitText, { color: t.colors.text }]}>{b}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <Text style={[styles.price, { color: t.colors.primaryDeep }]}>4,99 €/mois</Text>
          <Text style={[styles.trial, { color: t.colors.green }]}>Essai gratuit 30 jours</Text>
          <Text style={[styles.disclaimer, { color: t.colors.textSoft }]}>
            La sécurité reste gratuite, pour toujours.
          </Text>

          {/* CTA */}
          <Pressable style={[styles.cta, { backgroundColor: t.colors.green }]} onPress={onSubscribe}>
            <Text style={[styles.ctaText, { color: '#FFFFFF' }]}>
              Essayer 30 jours gratuitement
            </Text>
          </Pressable>

          <Pressable style={styles.dismiss} onPress={onClose}>
            <Text style={[styles.dismissText, { color: t.colors.textSoft }]}>Non merci</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  badgeRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 15,
  },
  title: {
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 16,
  },
  benefitsList: {
    marginTop: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  benefitText: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
  },
  price: {
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 24,
  },
  trial: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  disclaimer: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  cta: {
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  ctaText: {
    fontWeight: '600',
    fontSize: 15,
  },
  dismiss: {
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  dismissText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
