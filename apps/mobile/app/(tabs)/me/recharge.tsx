import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

const amounts = [
  { val: '10 €', klm: '~99 000 $KLM', selected: true },
  { val: '25 €', klm: '~248 000 $KLM', selected: false },
  { val: '100 €', klm: '~990 000 $KLM', selected: false },
];

export default function RechargeScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Recharger</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Current balance */}
        <View style={[styles.balanceCard, { backgroundColor: t.colors.card }]}>
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceLabel, { color: t.colors.text }]}>Solde actuel</Text>
            <Text style={[styles.balanceValue, { color: t.colors.primaryDeep }]}>9,93 €</Text>
          </View>
          <View style={[styles.gaugeTrack, { backgroundColor: t.colors.border }]}>
            <View style={[styles.gaugeGreen, { backgroundColor: t.colors.accent }]} />
            <View style={[styles.gaugeYellow, { backgroundColor: '#E5A100' }]} />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: t.colors.primaryDeep }]}>Recharger votre dépôt</Text>
        <Text style={[styles.description, { color: t.colors.text }]}>
          Ce dépôt vous protège du spam et couvre vos messages. Il est récupérable à tout moment.
        </Text>

        {/* Amount pills */}
        <View style={styles.pillsRow}>
          {amounts.map((a, i) => (
            <Pressable
              key={i}
              onPress={() => setSelectedIndex(i)}
              style={[
                styles.pill,
                {
                  backgroundColor: selectedIndex === i ? t.colors.pale : t.colors.background,
                  borderColor: selectedIndex === i ? t.colors.accent : t.colors.border,
                  borderWidth: selectedIndex === i ? 2 : 1,
                },
              ]}
            >
              <Text style={[styles.pillVal, { color: t.colors.primaryDeep }]}>{a.val}</Text>
              <Text style={[styles.pillKlm, { color: t.colors.textSoft }]}>{a.klm}</Text>
            </Pressable>
          ))}
        </View>

        {/* Equivalence */}
        <Text style={[styles.equiv, { color: t.colors.text }]}>
          10 € ≈ 99 000 $KLM · ≈ 29 ans de messages
        </Text>
        <Text style={[styles.locked, { color: t.colors.textSoft }]}>Cours verrouillé 60 s</Text>

        {/* After recharge */}
        <Text style={[styles.afterRecharge, { color: t.colors.accent }]}>
          Après recharge : 19,93 € · ≈ 58 ans de messages
        </Text>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <Pressable style={styles.applePayBtn}>
          <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
          <Text style={styles.applePayText}> Pay</Text>
        </Pressable>
        <Pressable>
          <Text style={[styles.otherPayment, { color: t.colors.accent }]}>
            Autres moyens de paiement
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, borderBottomWidth: 0.5,
  },
  headerTitle: { fontWeight: '700', fontSize: 17, marginLeft: 12 },
  content: { flex: 1, paddingHorizontal: 20 },
  balanceCard: { borderRadius: 8, padding: 16, marginTop: 16 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { fontWeight: '500', fontSize: 14 },
  balanceValue: { fontWeight: '700', fontSize: 18 },
  gaugeTrack: { height: 6, borderRadius: 3, flexDirection: 'row', overflow: 'hidden' },
  gaugeGreen: { width: '80%', height: 6 },
  gaugeYellow: { width: '19%', height: 6 },
  title: { fontWeight: '700', fontSize: 22, marginTop: 24 },
  description: { fontWeight: '400', fontSize: 14, marginTop: 8, lineHeight: 21 },
  pillsRow: { flexDirection: 'row', gap: 12, marginTop: 24, justifyContent: 'center' },
  pill: {
    width: 100, height: 56, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  pillVal: { fontWeight: '700', fontSize: 20 },
  pillKlm: { fontWeight: '400', fontSize: 12 },
  equiv: { textAlign: 'center', marginTop: 16, fontWeight: '500', fontSize: 14 },
  locked: { textAlign: 'center', marginTop: 4, fontSize: 12 },
  afterRecharge: { textAlign: 'center', marginTop: 16, fontWeight: '500', fontSize: 14 },
  bottomActions: { paddingHorizontal: 20, paddingBottom: 32 },
  applePayBtn: {
    backgroundColor: '#000000', borderRadius: 999, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  applePayText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  otherPayment: { textAlign: 'center', fontWeight: '600', fontSize: 15 },
});
