import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

const referrals = [
  { name: 'Amine', handle: 'amine.kalam', status: 'active' as const, messages: 50 },
  { name: 'Yassine', handle: 'yassine.kalam', status: 'active' as const, messages: 50 },
  { name: 'Ghita', handle: 'ghita.kalam', status: 'active' as const, messages: 50 },
  { name: 'Nadir', handle: 'nadir.kalam', status: 'active' as const, messages: 50 },
  { name: 'Lucile', handle: 'lucile.kalam', status: 'pending' as const, messages: 23 },
  { name: 'Romeo', handle: 'romeo.kalam', status: 'pending' as const, messages: 37 },
];

export default function InvitationsScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Invitations et gains</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: t.colors.background }]}>
          <View style={[styles.iconCircle, { backgroundColor: t.colors.accentLight }]}>
            <Ionicons name="gift-outline" size={32} color="#E5A100" />
          </View>
          <Text style={[styles.heroTitle, { color: t.colors.primaryDeep }]}>
            Offrez Kalam à vos proches
          </Text>
          <Text style={[styles.heroDesc, { color: t.colors.text }]}>
            Avancez 10 € pour un ami. Récupérez-les doublés quand il est actif.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#E5A100' }]}>40 €</Text>
              <Text style={[styles.statLabel, { color: t.colors.textSoft }]}>récupérés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: t.colors.accent }]}>4</Text>
              <Text style={[styles.statLabel, { color: t.colors.textSoft }]}>actifs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: t.colors.text }]}>2</Text>
              <Text style={[styles.statLabel, { color: t.colors.textSoft }]}>en attente</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <Pressable style={[styles.inviteBtn, { backgroundColor: t.colors.accent }]}>
          <Text style={[styles.inviteBtnText, { color: t.colors.background }]}>Inviter un ami</Text>
        </Pressable>

        {/* Referral link */}
        <View style={[styles.linkRow, { backgroundColor: t.colors.background }]}>
          <Text style={[styles.linkText, { color: t.colors.text }]}>kalam.chat/invite/réda</Text>
          <Pressable style={[styles.copyBtn, { backgroundColor: t.colors.accent }]}>
            <Text style={[styles.copyBtnText, { color: t.colors.background }]}>Copier</Text>
          </Pressable>
        </View>

        {/* Referral list */}
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Mes filleuls</Text>

        {referrals.map((r, i) => (
          <View key={i} style={[styles.row, { backgroundColor: t.colors.background }]}>
            <View style={[styles.avatar, { backgroundColor: t.colors.pale }]}>
              <Text style={[styles.avatarText, { color: t.colors.primaryDeep }]}>{r.name[0]}</Text>
            </View>
            <View style={styles.nameCol}>
              <Text style={[styles.handle, { color: t.colors.text }]}>{r.handle}</Text>
            </View>
            {r.status === 'active' ? (
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle-outline" size={14} color={t.colors.accent} />
                <Text style={[styles.statusText, { color: t.colors.accent }]}> Actif · 10 € récup.</Text>
              </View>
            ) : (
              <View style={styles.pendingRow}>
                <View style={styles.pendingInfo}>
                  <Ionicons name="time-outline" size={14} color="#B8860B" />
                  <Text style={styles.pendingText}> {r.messages}/50</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: t.colors.border }]}>
                  <View style={[styles.progressFill, { width: `${(r.messages / 50) * 100}%`, backgroundColor: '#E5A100' }]} />
                </View>
              </View>
            )}
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
  heroCard: { marginTop: 16, borderRadius: 10, padding: 16, alignItems: 'center' },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { marginTop: 8, fontWeight: '700', fontSize: 22, textAlign: 'center' },
  heroDesc: { marginTop: 8, fontSize: 14, textAlign: 'center', lineHeight: 21 },
  statsRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  statItem: { alignItems: 'center' },
  statValue: { fontWeight: '700', fontSize: 22 },
  statLabel: { fontSize: 12, marginTop: 2 },
  inviteBtn: {
    marginTop: 24, height: 52, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  inviteBtnText: { fontWeight: '600', fontSize: 15 },
  linkRow: {
    marginTop: 12, borderRadius: 6, paddingVertical: 12, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  linkText: { fontSize: 12 },
  copyBtn: { borderRadius: 4, paddingVertical: 5, paddingHorizontal: 12 },
  copyBtnText: { fontWeight: '600', fontSize: 12 },
  sectionTitle: { marginTop: 24, fontWeight: '600', fontSize: 15 },
  row: {
    flexDirection: 'row', alignItems: 'center', height: 56,
    borderRadius: 12, paddingHorizontal: 16, marginTop: 8,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontWeight: '700', fontSize: 15 },
  nameCol: { flex: 1, marginLeft: 12 },
  handle: { fontSize: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontWeight: '500', fontSize: 12 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pendingInfo: { flexDirection: 'row', alignItems: 'center' },
  pendingText: { fontWeight: '500', fontSize: 12, color: '#B8860B' },
  progressTrack: { width: 40, height: 3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2 },
});
