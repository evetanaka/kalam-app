import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const features: [string, string, string][] = [
  ['Chiffrement E2E', '✓', '✓'],
  ['Messagerie 1:1', '✓', '✓'],
  ['Groupes ≤ 100', '✓', '✓'],
  ['Groupes ≤ 1 000', '✗', '✓'],
  ['Comptes multiples', '1', '5'],
  ['Médias', 'Texte', 'Tous'],
  ['Communautés payantes', '✗', '✓'],
  ['Parrainage doublé', '✗', '✓'],
];

export default function KalamPlusScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Kalam+</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Badge */}
        <View style={[styles.badge, { backgroundColor: t.colors.accentLight }]}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: t.colors.accent }}>KALAM+</Text>
        </View>

        <Text style={{ marginTop: 16, fontWeight: '700', fontSize: 22, color: t.colors.primaryDeep, textAlign: 'center' }}>
          Allez plus loin, en toute simplicité
        </Text>

        {/* Comparison table */}
        <View style={[styles.table, { backgroundColor: t.colors.card }]}>
          {/* Table header */}
          <View style={[styles.tableRow, { borderBottomColor: t.colors.border, borderBottomWidth: 1, paddingVertical: 8, paddingHorizontal: 12 }]}>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: t.colors.textSoft }} />
            <Text style={{ width: 70, textAlign: 'center', fontSize: 13, fontWeight: '600', color: t.colors.textSoft }}>Gratuit</Text>
            <Text style={{ width: 70, textAlign: 'center', fontSize: 13, fontWeight: '600', color: t.colors.accent }}>Kalam+</Text>
          </View>
          {features.map(([feature, free, plus], i) => (
            <View key={i} style={[styles.tableRow, { backgroundColor: t.colors.background, paddingVertical: 8, paddingHorizontal: 12 }, i < features.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.colors.border }]}>
              <Text style={{ flex: 1, fontSize: 13, color: t.colors.text }} numberOfLines={1}>{feature}</Text>
              <Text style={{ width: 70, textAlign: 'center', fontSize: 13, color: free === '✗' ? t.colors.textSoft : t.colors.text }}>{free}</Text>
              <Text style={{ width: 70, textAlign: 'center', fontSize: 13, color: plus === '✓' ? t.colors.primary : t.colors.text }}>{plus}</Text>
            </View>
          ))}
        </View>

        {/* Price */}
        <Text style={{ marginTop: 24, fontWeight: '700', fontSize: 22, color: t.colors.primaryDeep, textAlign: 'center' }}>4,99 €/mois</Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: t.colors.textSoft, textAlign: 'center' }}>Essai gratuit 30 jours · annulable à tout moment</Text>
        <Text style={{ marginTop: 8, fontSize: 12, color: t.colors.textSoft, fontStyle: 'italic', textAlign: 'center' }}>La sécurité reste gratuite, pour toujours.</Text>

        {/* CTA */}
        <Pressable style={[styles.cta, { backgroundColor: t.colors.primary }]}>
          <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.background }}>Essayer 30 jours gratuitement</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: 12, color: t.colors.textSoft }}>CGU</Text>
          <Text style={{ fontSize: 12, color: t.colors.textSoft }}>Politique de confidentialité</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  badge: { marginTop: 24, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 16 },
  table: { marginTop: 24, width: '100%', borderRadius: 10, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  cta: { marginTop: 24, width: '100%', height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
