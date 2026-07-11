import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

export default function ReferralScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Inviter des amis</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Illustration */}
        <View style={[styles.iconCircle, { backgroundColor: t.colors.accentLight }]}>
          <Ionicons name="gift-outline" size={40} color="#E5A100" />
        </View>

        <Text style={[styles.title, { color: t.colors.primaryDeep }]}>
          Offrez Kalam à vos proches
        </Text>

        <Text style={[styles.description, { color: t.colors.text }]}>
          Avancez le dépôt de 10 € pour un ami. Quand il est actif (≥ 50 messages en 30 jours),
          vous récupérez vos 10 €, doublés en réserve de messages.
        </Text>

        <View style={[styles.badge, { backgroundColor: t.colors.accentLight }]}>
          <Text style={styles.badgeText}>Kalam+ : gains doublés encore !</Text>
        </View>

        {/* Gains card */}
        <View style={[styles.gainsCard, { backgroundColor: t.colors.background }]}>
          <Text style={[styles.gainsLabel, { color: t.colors.text }]}>Vos gains</Text>
          <Text style={[styles.gainsValue, { color: '#E5A100' }]}>40,00 € récupérés</Text>
          <Text style={[styles.gainsDetail, { color: t.colors.textSoft }]}>4 filleuls actifs</Text>
        </View>

        {/* CTA */}
        <Pressable style={[styles.primaryBtn, { backgroundColor: t.colors.accent }]}>
          <Text style={[styles.primaryBtnText, { color: t.colors.background }]}>Inviter un ami</Text>
        </Pressable>

        <Pressable style={[styles.secondaryBtn, { borderColor: t.colors.accent }]}>
          <Text style={[styles.secondaryBtnText, { color: t.colors.accent }]}>Voir mes filleuls</Text>
        </Pressable>

        {/* Referral link */}
        <View style={[styles.linkRow, { backgroundColor: t.colors.card }]}>
          <Text style={[styles.linkText, { color: t.colors.text }]}>kalam.chat/invite/réda</Text>
          <Pressable style={[styles.copyBtn, { backgroundColor: t.colors.accent }]}>
            <Ionicons name="copy-outline" size={14} color={t.colors.background} />
            <Text style={[styles.copyBtnText, { color: t.colors.background }]}> Copier</Text>
          </Pressable>
        </View>
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
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 32 },
  iconCircle: {
    marginTop: 48, width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { marginTop: 16, fontWeight: '700', fontSize: 22, textAlign: 'center' },
  description: { marginTop: 8, fontSize: 14, textAlign: 'center', lineHeight: 21, maxWidth: 320 },
  badge: { marginTop: 8, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 },
  badgeText: { fontWeight: '600', fontSize: 12, color: '#8A6B13' },
  gainsCard: {
    marginTop: 24, width: '100%', borderRadius: 10, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  gainsLabel: { fontWeight: '600', fontSize: 15 },
  gainsValue: { fontWeight: '700', fontSize: 22, marginTop: 8 },
  gainsDetail: { fontSize: 12, marginTop: 4 },
  primaryBtn: {
    marginTop: 24, width: '100%', height: 52, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { fontWeight: '600', fontSize: 15 },
  secondaryBtn: {
    marginTop: 8, width: '100%', height: 44, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  secondaryBtnText: { fontWeight: '600', fontSize: 15 },
  linkRow: {
    marginTop: 16, width: '100%', borderRadius: 6, paddingVertical: 12,
    paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkText: { fontSize: 14 },
  copyBtn: {
    borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center',
  },
  copyBtnText: { fontWeight: '600', fontSize: 13 },
});
