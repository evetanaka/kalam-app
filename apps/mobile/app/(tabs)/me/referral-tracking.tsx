import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

const referrals = [
  { name: 'Amine', handle: 'amine.kalam', status: 'active' as const, messages: 50, amount: 10 },
  { name: 'Yassine', handle: 'yassine.kalam', status: 'active' as const, messages: 50, amount: 10 },
  { name: 'Ghita', handle: 'ghita.kalam', status: 'active' as const, messages: 50, amount: 10 },
  { name: 'Nadir', handle: 'nadir.kalam', status: 'active' as const, messages: 50, amount: 10 },
  { name: 'Lucile', handle: 'lucile.kalam', status: 'pending' as const, messages: 23, amount: 0 },
  { name: 'Romeo', handle: 'romeo.kalam', status: 'pending' as const, messages: 37, amount: 0 },
  { name: 'Javier', handle: 'javier.kalam', status: 'inactive' as const, messages: 3, amount: 0 },
];

export default function ReferralTrackingScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Mes filleuls</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: t.colors.background }]}>
          <Text style={[styles.summaryText, { color: t.colors.text }]}>
            4 actifs · 2 en attente · 40 € récupérés
          </Text>
        </View>

        {/* List */}
        {referrals.map((r, i) => (
          <View key={i} style={[styles.row, { backgroundColor: t.colors.background }]}>
            <View style={[styles.avatar, { backgroundColor: t.colors.pale }]}>
              <Text style={[styles.avatarText, { color: t.colors.primaryDeep }]}>{r.name[0]}</Text>
            </View>
            <View style={styles.nameCol}>
              <Text style={[styles.handle, { color: t.colors.text }]}>{r.handle}</Text>
              {r.status === 'pending' && (
                <View style={styles.progressRow}>
                  <View style={[styles.progressTrack, { backgroundColor: t.colors.border }]}>
                    <View
                      style={[styles.progressFill, { width: `${(r.messages / 50) * 100}%`, backgroundColor: '#E5A100' }]}
                    />
                  </View>
                </View>
              )}
            </View>
            <View style={styles.statusCol}>
              {r.status === 'active' && (
                <>
                  <View style={styles.statusRow}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={t.colors.accent} />
                    <Text style={[styles.statusText, { color: t.colors.accent }]}> Actif</Text>
                  </View>
                  <Text style={[styles.statusDetail, { color: t.colors.accent }]}>10 € récup. + 10 € bonus</Text>
                </>
              )}
              {r.status === 'pending' && (
                <View style={styles.statusRow}>
                  <Ionicons name="time-outline" size={14} color="#B8860B" />
                  <Text style={[styles.statusText, { color: '#B8860B' }]}> {r.messages} / 50 msg</Text>
                </View>
              )}
              {r.status === 'inactive' && (
                <View style={styles.statusRow}>
                  <Ionicons name="close-circle-outline" size={14} color={t.colors.textSoft} />
                  <Text style={[styles.statusText, { color: t.colors.textSoft }]}> Inactif</Text>
                </View>
              )}
            </View>
          </View>
        ))}
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
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 17 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  summaryCard: { marginTop: 16, borderRadius: 10, padding: 16 },
  summaryText: { fontWeight: '500', fontSize: 14 },
  row: {
    flexDirection: 'row', alignItems: 'center', height: 64,
    borderRadius: 12, paddingHorizontal: 16, marginTop: 8,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontWeight: '700', fontSize: 16 },
  nameCol: { flex: 1, marginLeft: 12 },
  handle: { fontSize: 14 },
  progressRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center' },
  progressTrack: { width: 60, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  statusCol: { alignItems: 'flex-end' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontWeight: '500', fontSize: 12 },
  statusDetail: { fontSize: 12, marginTop: 2 },
});
