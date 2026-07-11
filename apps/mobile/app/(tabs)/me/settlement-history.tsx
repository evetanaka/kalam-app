import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

const settlements = [
  { period: 'Sem. du 6 juil.', detail: '312 messages · 0,03 €', status: 'En cours', isOngoing: true },
  { period: 'Sem. du 29 juin', detail: '287 messages · 0,03 €', status: 'Réglé', isOngoing: false },
  { period: 'Sem. du 22 juin', detail: '198 messages · 0,02 €', status: 'Réglé', isOngoing: false },
  { period: 'Sem. du 15 juin', detail: '342 messages · 0,03 €', status: 'Réglé', isOngoing: false },
  { period: 'Sem. du 8 juin', detail: '156 messages · 0,02 €', status: 'Réglé', isOngoing: false },
  { period: 'Sem. du 1 juin', detail: '410 messages · 0,04 €', status: 'Réglé', isOngoing: false },
];

export default function SettlementHistoryScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Historique des règlements</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.list}>
        {settlements.map((s, i) => (
          <Pressable
            key={i}
            style={[styles.row, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}
            onPress={() => router.push('/(tabs)/me/settlement-detail')}
          >
            <View style={styles.rowLeft}>
              <Text style={[styles.period, { color: t.colors.text }]}>{s.period}</Text>
              <Text style={[styles.detail, { color: t.colors.textSoft }]}>{s.detail}</Text>
            </View>
            <View style={styles.rowRight}>
              <Ionicons
                name={s.isOngoing ? 'time-outline' : 'checkmark-circle-outline'}
                size={14}
                color={s.isOngoing ? '#E5A100' : t.colors.accent}
              />
              <Text style={[styles.status, { color: s.isOngoing ? '#E5A100' : t.colors.accent }]}>
                {s.status}
              </Text>
              <Text style={[styles.chevron, { color: t.colors.textSoft }]}>›</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={[styles.footer, { color: t.colors.textSoft }]}>
        Les règlements sont effectués chaque dimanche sur la blockchain Ethereum.
      </Text>
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
  list: { flex: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  rowLeft: { flex: 1 },
  period: { fontWeight: '500', fontSize: 14 },
  detail: { fontWeight: '400', fontSize: 13, marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  status: { fontSize: 12 },
  chevron: { fontSize: 14, marginLeft: 4 },
  footer: {
    textAlign: 'center', fontSize: 12, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 32,
  },
});
