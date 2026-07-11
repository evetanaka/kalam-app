import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const settlements = [
  { date: '1 juil. 2026', amount: '-0,03 €', desc: '12 messages reçus d\'inconnus' },
  { date: '1 juin 2026', amount: '-0,02 €', desc: '9 messages reçus d\'inconnus' },
  { date: '1 mai 2026', amount: '-0,04 €', desc: '15 messages reçus d\'inconnus' },
];

const details: [string, string][] = [
  ['Dépôt initial', '10,00 €'],
  ['Garantie (plancher)', '8,00 € (80%)'],
  ['Réserve utilisée', '0,07 €'],
  ['Solde disponible', '9,93 €'],
];

export default function DepositScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Mon dépôt</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gauge */}
        <View style={[styles.gaugeCard, { backgroundColor: t.colors.background }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={{ fontWeight: '700', fontSize: 22, color: t.colors.primaryDeep }}>9,93 €</Text>
            <Text style={{ fontSize: 12, color: t.colors.textSoft }}>≈ 14 ans de messages</Text>
          </View>
          <View style={[styles.gaugeBar, { backgroundColor: t.colors.border }]}>
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80%', backgroundColor: t.colors.accent, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }} />
            <View style={{ position: 'absolute', left: '80%', top: 0, bottom: 0, width: '19.3%', backgroundColor: t.colors.primary }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: t.colors.accent }} />
              <Text style={{ fontSize: 12, color: t.colors.textSoft }}>Garantie 8,00 €</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: t.colors.primary }} />
              <Text style={{ fontSize: 12, color: t.colors.textSoft }}>Réserve 1,93 €</Text>
            </View>
          </View>
          <Text style={{ marginTop: 12, fontSize: 12, color: t.colors.textSoft }}>Prochain règlement : 1 août 2026</Text>
        </View>

        {/* Buttons */}
        <Pressable style={[styles.primaryBtn, { backgroundColor: t.colors.primary }]}>
          <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.background }}>Recharger</Text>
        </Pressable>
        <Pressable style={[styles.outlineBtn, { borderColor: t.colors.primary }]}>
          <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.primary }}>Récupérer mon dépôt</Text>
        </Pressable>

        {/* Settlement history */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.text }}>Historique des règlements</Text>
            <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.primary }}>Voir tout</Text>
          </View>
          {settlements.map((s, i) => (
            <View key={i} style={[styles.settlementRow, { backgroundColor: t.colors.background }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.text }}>{s.desc}</Text>
                <Text style={{ fontSize: 12, color: t.colors.textSoft, marginTop: 2 }}>{s.date}</Text>
              </View>
              <Text style={{ fontFamily: 'JetBrainsMono', fontWeight: '500', fontSize: 14, color: t.colors.danger }}>{s.amount}</Text>
            </View>
          ))}
        </View>

        {/* Details */}
        <View style={[styles.detailsCard, { backgroundColor: t.colors.background }]}>
          {details.map(([label, value], i) => (
            <View key={i} style={[styles.detailRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: t.colors.border }]}>
              <Text style={{ fontSize: 14, color: t.colors.text }}>{label}</Text>
              <Text style={{ fontFamily: 'JetBrainsMono', fontWeight: '500', fontSize: 14, color: t.colors.text }}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  gaugeCard: { marginTop: 16, borderRadius: 10, padding: 16 },
  gaugeBar: { marginTop: 16, height: 24, borderRadius: 6, overflow: 'hidden', position: 'relative' },
  primaryBtn: { marginTop: 24, width: '100%', height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  outlineBtn: { marginTop: 8, width: '100%', height: 44, borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  settlementRow: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailsCard: { marginTop: 16, borderRadius: 10, padding: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
});
