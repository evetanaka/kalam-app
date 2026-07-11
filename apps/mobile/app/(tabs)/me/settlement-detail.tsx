import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

const distribution = [
  { label: 'Brûlé (déflationnaire)', pct: 50, amount: '0,015 €', colorKey: 'danger' as const },
  { label: 'Relais Waku', pct: 40, amount: '0,012 €', colorKey: 'accent' as const },
  { label: 'Trésorerie DAO', pct: 10, amount: '0,003 €', colorKey: 'textSoft' as const },
];

export default function SettlementDetailScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  const getColor = (key: string) => (t.colors as any)[key];

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Règlement</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.periodTitle, { color: t.colors.primaryDeep }]}>
          Semaine du 6 au 12 juillet 2026
        </Text>

        {/* Summary card */}
        <View style={[styles.card, { backgroundColor: t.colors.background }]}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summaryLabel, { color: t.colors.textSoft }]}>Messages envoyés</Text>
              <Text style={[styles.summaryValue, { color: t.colors.primaryDeep }]}>312</Text>
            </View>
            <View style={styles.alignRight}>
              <Text style={[styles.summaryLabel, { color: t.colors.textSoft }]}>Coût total</Text>
              <Text style={[styles.summaryValue, { color: '#E5A100' }]}>0,03 €</Text>
            </View>
          </View>
          <View style={[styles.divider, { borderTopColor: t.colors.border }]}>
            <Text style={[styles.costPerMsg, { color: t.colors.textSoft }]}>Coût par message</Text>
            <Text style={[styles.costPerMsgVal, { color: t.colors.textSoft }]}>0,0001 €</Text>
          </View>
          <View style={styles.settledRow}>
            <Ionicons name="checkmark-circle-outline" size={14} color={t.colors.accent} />
            <Text style={[styles.settledText, { color: t.colors.accent }]}>
              Réglé le 12/07 à 03:42 UTC
            </Text>
          </View>
        </View>

        {/* Distribution card */}
        <View style={[styles.card, { backgroundColor: t.colors.background, marginTop: 24 }]}>
          <Text style={[styles.distTitle, { color: t.colors.primaryDeep }]}>Répartition du coût</Text>

          {/* Stacked bar */}
          <View style={styles.barContainer}>
            {distribution.map((d, i) => (
              <View key={i} style={{ width: `${d.pct}%` as any, height: 8, backgroundColor: getColor(d.colorKey) }} />
            ))}
          </View>

          {distribution.map((d, i) => (
            <View
              key={i}
              style={[
                styles.distRow,
                i < 2 && { borderBottomWidth: 0.5, borderBottomColor: t.colors.border },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: getColor(d.colorKey) }]} />
              <Text style={[styles.distLabel, { color: t.colors.text }]} numberOfLines={1}>
                {d.label}
              </Text>
              <Text style={[styles.distAmount, { color: t.colors.primaryDeep }]}>{d.amount}</Text>
              <Text style={[styles.distPct, { color: t.colors.textSoft }]}>{d.pct}%</Text>
            </View>
          ))}
        </View>

        {/* Etherscan link */}
        <Pressable style={styles.etherscanRow} onPress={() => Linking.openURL('https://etherscan.io')}>
          <Text style={[styles.etherscanText, { color: t.colors.accent }]}>
            Voir la transaction sur Etherscan
          </Text>
          <Ionicons name="open-outline" size={14} color={t.colors.accent} />
        </Pressable>
      </ScrollView>
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  periodTitle: { fontWeight: '600', fontSize: 15, marginTop: 24 },
  card: { borderRadius: 10, padding: 16, marginTop: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  alignRight: { alignItems: 'flex-end' },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontWeight: '700', fontSize: 22, marginTop: 8 },
  divider: { borderTopWidth: 0.5, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  costPerMsg: { fontSize: 13 },
  costPerMsgVal: { fontSize: 13 },
  settledRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  settledText: { fontSize: 12 },
  distTitle: { fontWeight: '600', fontSize: 15, marginBottom: 16 },
  barContainer: { height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden', marginBottom: 16 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  distLabel: { flex: 1, fontSize: 14 },
  distAmount: { fontWeight: '500', fontSize: 13 },
  distPct: { fontSize: 12 },
  etherscanRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginTop: 24,
  },
  etherscanText: { fontWeight: '500', fontSize: 14 },
});
