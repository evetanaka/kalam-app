import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

const SEVERITY_STEPS = ['Avertissement', '10 %', '50 %', 'Exclusion'];

export default function SlashNotificationScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Warning icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="warning" size={48} color={t.colors.danger} />
        </View>

        <Text style={[styles.title, { color: t.colors.danger }]}>Votre dépôt a été entaillé</Text>
        <Text style={[styles.amount, { color: t.colors.danger }]}>−1,00 € (10 %)</Text>

        <Text style={[styles.reason, { color: t.colors.text }]}>
          Motif : signalements confirmés de 3 utilisateurs indépendants
        </Text>

        {/* Gauge */}
        <View style={{ width: '100%', marginTop: 24 }}>
          <View style={styles.gaugeHeader}>
            <Text style={[styles.gaugeLabel, { color: t.colors.textSoft }]}>Dépôt restant</Text>
            <Text style={[styles.gaugeValue, { color: t.colors.text }]}>9,00 €</Text>
          </View>
          <View style={[styles.gaugeTrack, { backgroundColor: t.colors.background }]}>
            <View style={[styles.gaugeFill, { width: '90%', backgroundColor: t.colors.primary }]} />
          </View>
        </View>

        {/* Scale card */}
        <View style={[styles.scaleCard, { backgroundColor: t.colors.background }]}>
          <Text style={[styles.scaleTitle, { color: t.colors.textSoft }]}>Votre situation :</Text>
          <View style={styles.scaleRow}>
            {SEVERITY_STEPS.map((step, i) => (
              <View key={i} style={styles.stepWrap}>
                <Text style={[styles.stepText, {
                  fontWeight: i === 1 ? '700' : '400',
                  color: i === 1 ? t.colors.danger : t.colors.textSoft,
                }]}>
                  {step}
                </Text>
                {i < 3 && <Text style={{ color: t.colors.textSoft }}> → </Text>}
              </View>
            ))}
          </View>
        </View>

        {/* Buttons */}
        <Pressable
          onPress={() => router.push('/(tabs)/me/appeal')}
          style={[styles.contestButton, { borderColor: t.colors.border }]}
        >
          <Text style={[styles.contestButtonText, { color: t.colors.text }]}>Contester cette décision</Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={[styles.okButton, { backgroundColor: t.colors.primary }]}
        >
          <Text style={[styles.okButtonText, { color: t.colors.card }]}>J'ai compris</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, alignItems: 'center', paddingBottom: 24 },
  iconCircle: { marginTop: '20%', width: 96, height: 96, borderRadius: 48, backgroundColor: '#FDECEA', alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700', fontSize: 22, textAlign: 'center', marginTop: 24 },
  amount: { fontWeight: '700', fontSize: 28, textAlign: 'center', marginTop: 8 },
  reason: { fontSize: 14, textAlign: 'center', marginTop: 16, lineHeight: 21 },
  gaugeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  gaugeLabel: { fontSize: 12 },
  gaugeValue: { fontFamily: 'monospace', fontSize: 12 },
  gaugeTrack: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: 4 },
  scaleCard: { width: '100%', borderRadius: 12, padding: 16, marginTop: 24 },
  scaleTitle: { fontWeight: '600', fontSize: 12, marginBottom: 12 },
  scaleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  stepWrap: { flexDirection: 'row', alignItems: 'center' },
  stepText: { fontSize: 13 },
  contestButton: { width: '100%', height: 44, marginTop: 24, borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  contestButtonText: { fontWeight: '600', fontSize: 15 },
  okButton: { width: '100%', height: 52, marginTop: 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  okButtonText: { fontWeight: '600', fontSize: 15 },
});
