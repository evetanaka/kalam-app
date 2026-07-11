import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

const conversations = [
  { name: 'Famille Berrehili', size: '340 Mo' },
  { name: 'Amine Haddadi', size: '210 Mo' },
  { name: 'Dar Society Team', size: '180 Mo' },
  { name: 'Yassine Tamer', size: '150 Mo' },
  { name: 'Ghita', size: '120 Mo' },
];

const segments = [
  { label: 'Photos', size: '420 Mo', colorKey: 'accent' as const, pct: 35 },
  { label: 'Vidéos', size: '310 Mo', colorKey: null, pct: 26 },
  { label: 'Documents', size: '280 Mo', colorKey: 'primaryDeep' as const, pct: 23 },
  { label: 'Messages', size: '190 Mo', colorKey: 'textSoft' as const, pct: 16 },
];

const qualityOptions = ['Éco', 'Standard', 'Originale'];

export default function StorageScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [wifiOn, setWifiOn] = useState(true);
  const [cellularOn, setCellularOn] = useState(false);
  const [quality, setQuality] = useState(1);

  const getSegColor = (s: typeof segments[0]) => {
    if (s.colorKey) return (t.colors as any)[s.colorKey];
    return '#E5A100'; // yellow for vidéos
  };

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Stockage et données</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Total usage */}
        <View style={[styles.card, { backgroundColor: t.colors.background }]}>
          <Text style={[styles.totalSize, { color: t.colors.primaryDeep }]}>1,2 Go</Text>
          <Text style={[styles.totalLabel, { color: t.colors.textSoft }]}>utilisés sur cet appareil</Text>

          {/* Segmented bar */}
          <View style={styles.barContainer}>
            {segments.map((s, i) => (
              <View key={i} style={{ width: `${s.pct}%` as any, height: 12, backgroundColor: getSegColor(s) }} />
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            {segments.map((s, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getSegColor(s) }]} />
                <Text style={[styles.legendText, { color: t.colors.textSoft }]}>{s.label} · {s.size}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Per conversation */}
        <Text style={[styles.sectionHeader, { color: t.colors.textSoft }]}>Par conversation</Text>
        {conversations.map((conv, i) => (
          <Pressable key={i} style={[styles.convRow, { backgroundColor: t.colors.background }]}>
            <Text style={[styles.convName, { color: t.colors.text }]}>{conv.name}</Text>
            <Text style={[styles.convSize, { color: t.colors.textSoft }]}>{conv.size}</Text>
          </Pressable>
        ))}

        {/* Auto-download toggles */}
        <View style={[styles.card, { backgroundColor: t.colors.background, marginTop: 24 }]}>
          <Text style={[styles.sectionHeaderInCard, { color: t.colors.textSoft }]}>
            Téléchargement auto des médias
          </Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: t.colors.text }]}>Wi-Fi</Text>
            <Switch
              value={wifiOn}
              onValueChange={setWifiOn}
              trackColor={{ false: t.colors.border, true: t.colors.accent }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: t.colors.text }]}>Cellulaire</Text>
            <Switch
              value={cellularOn}
              onValueChange={setCellularOn}
              trackColor={{ false: t.colors.border, true: t.colors.accent }}
            />
          </View>
        </View>

        {/* Quality picker */}
        <View style={[styles.card, { backgroundColor: t.colors.background, marginTop: 8 }]}>
          <Text style={[styles.sectionHeaderInCard, { color: t.colors.textSoft }]}>
            Qualité des photos envoyées
          </Text>
          <View style={styles.qualityRow}>
            {qualityOptions.map((q, i) => (
              <Pressable
                key={i}
                onPress={() => setQuality(i)}
                style={[
                  styles.qualityBtn,
                  {
                    backgroundColor: quality === i ? t.colors.accent : 'transparent',
                    borderColor: quality === i ? t.colors.accent : t.colors.border,
                    marginLeft: i > 0 ? 8 : 0,
                  },
                ]}
              >
                <Text style={[
                  styles.qualityBtnText,
                  { color: quality === i ? t.colors.background : t.colors.text },
                ]}>
                  {q}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Clear cache */}
        <Pressable style={[styles.clearBtn, { borderColor: t.colors.danger }]}>
          <Text style={[styles.clearBtnText, { color: t.colors.danger }]}>Vider le cache</Text>
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
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 17 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  card: { borderRadius: 10, padding: 16 },
  totalSize: { fontWeight: '700', fontSize: 22 },
  totalLabel: { marginTop: 8, fontSize: 12 },
  barContainer: { marginTop: 16, height: 12, borderRadius: 6, flexDirection: 'row', overflow: 'hidden' },
  legendRow: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 12 },
  sectionHeader: {
    marginTop: 24, fontWeight: '600', fontSize: 12,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  sectionHeaderInCard: {
    fontWeight: '600', fontSize: 12,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },
  convRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    height: 48, borderRadius: 12, paddingHorizontal: 20, marginTop: 4,
  },
  convName: { fontSize: 14 },
  convSize: { fontSize: 12 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  toggleLabel: { fontWeight: '500', fontSize: 14 },
  qualityRow: { flexDirection: 'row', justifyContent: 'space-between' },
  qualityBtn: {
    flex: 1, height: 44, borderRadius: 999, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  qualityBtnText: { fontWeight: '600', fontSize: 14 },
  clearBtn: {
    marginTop: 24, height: 44, borderRadius: 999,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  clearBtnText: { fontWeight: '600', fontSize: 15 },
});
