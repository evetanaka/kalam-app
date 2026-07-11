import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const digits = '37291 84653 12908 47562 93017 58426 70394 81265 49037 26184 50739 82641';
const groups = digits.split(' ');

// Simple QR placeholder grid
const filledCells = [0,1,2,5,6,7,8,9,14,16,23,24,31,32,39,40,47,48,49,54,56,57,58,61,62,63];

export default function KeyVerify() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>
          Vérification de sécurité
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Explanation */}
        <Text style={[styles.explanation, { color: t.colors.text }]}>
          Pour vérifier que vos messages sont bien chiffrés avec Amine, comparez ce code avec celui
          affiché sur son téléphone.
        </Text>

        {/* QR code placeholder */}
        <View style={[styles.qrBorder, { borderColor: t.colors.primary }]}>
          <View style={[styles.qrGrid, { backgroundColor: t.colors.background }]}>
            {Array.from({ length: 64 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.qrCell,
                  {
                    backgroundColor: filledCells.includes(i)
                      ? t.colors.primaryDeep
                      : t.colors.card,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separatorRow}>
          <View style={[styles.separatorLine, { backgroundColor: t.colors.border }]} />
          <Text style={[styles.separatorText, { color: t.colors.textSoft }]}>
            ou comparez les 60 chiffres
          </Text>
          <View style={[styles.separatorLine, { backgroundColor: t.colors.border }]} />
        </View>

        {/* 60-digit grid (4 rows × 3 columns) */}
        <View style={styles.digitGrid}>
          {groups.map((g, i) => (
            <Text key={i} style={[styles.digitGroup, { color: t.colors.primaryDeep }]}>
              {g}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Scan button */}
      <View style={styles.footer}>
        <Pressable style={[styles.scanBtn, { backgroundColor: t.colors.primary }]}>
          <Ionicons name="scan" size={18} color="#fff" />
          <Text style={styles.scanText}>Scanner le QR de Amine</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 0.5 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  content: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 100 },
  explanation: { fontSize: 14, textAlign: 'center', maxWidth: 320, marginTop: 24, lineHeight: 21 },
  qrBorder: { width: 200, height: 200, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  qrGrid: { width: 160, height: 160, borderRadius: 4, flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 2 },
  qrCell: { width: 16, height: 16, borderRadius: 1 },
  separatorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, width: '100%', maxWidth: 300 },
  separatorLine: { flex: 1, height: 0.5 },
  separatorText: { fontSize: 13 },
  digitGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 12, maxWidth: 300, gap: 8 },
  digitGroup: { width: '30%', textAlign: 'center', fontFamily: 'JetBrains Mono', fontWeight: '500', fontSize: 18, letterSpacing: 1 },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  scanBtn: { borderRadius: 999, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  scanText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
