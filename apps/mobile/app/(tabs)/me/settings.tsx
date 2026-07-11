import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState(0);
  const [toggles, setToggles] = useState([true, true, true, false]);
  const toggle = (i: number) => setToggles(prev => prev.map((v, j) => j === i ? !v : v));

  const radioItems = [
    { label: 'Standard (APNs / FCM)', hint: 'Existence d\'une activité visible par Apple/Google, pas le contenu.' },
    { label: 'UnifiedPush (Android)', hint: 'Aucune fuite vers Google.' },
    { label: 'Polling', hint: 'Parano maximale, impact batterie.' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ paddingHorizontal: 20 }} contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
        {/* Mode */}
        <View style={[styles.section, { backgroundColor: t.colors.background }]}>
          <Text style={[styles.sectionLabel, { color: t.colors.textSoft }]}>MODE DE NOTIFICATION</Text>
          {radioItems.map((item, i) => (
            <Pressable key={i} onPress={() => setMode(i)} style={[styles.radioRow, { borderBottomColor: t.colors.border }]}>
              <View style={[styles.radio, { borderColor: mode === i ? t.colors.primary : t.colors.border }]}>
                {mode === i && <View style={[styles.radioInner, { backgroundColor: t.colors.primary }]} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.text }}>{item.label}</Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: t.colors.textSoft, fontStyle: 'italic' }}>{item.hint}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Sons */}
        <View style={[styles.section, { backgroundColor: t.colors.background, marginTop: 8 }]}>
          <Text style={[styles.sectionLabel, { color: t.colors.textSoft }]}>SONS</Text>
          <View style={styles.switchRow}>
            <Text style={{ flex: 1, fontWeight: '500', fontSize: 14, color: t.colors.text }}>Son de message</Text>
            <Switch value={toggles[0]} onValueChange={() => toggle(0)} trackColor={{ false: t.colors.border, true: t.colors.primary }} thumbColor="#fff" />
          </View>
        </View>

        {/* Conversations */}
        <View style={[styles.section, { backgroundColor: t.colors.background, marginTop: 8 }]}>
          <Text style={[styles.sectionLabel, { color: t.colors.textSoft }]}>CONVERSATIONS</Text>
          <View style={styles.switchRow}>
            <Text style={{ flex: 1, fontWeight: '500', fontSize: 14, color: t.colors.text }}>Aperçu du message</Text>
            <Switch value={toggles[1]} onValueChange={() => toggle(1)} trackColor={{ false: t.colors.border, true: t.colors.primary }} thumbColor="#fff" />
          </View>
        </View>

        {/* Groups */}
        <View style={[styles.section, { backgroundColor: t.colors.background, marginTop: 8 }]}>
          <Text style={[styles.sectionLabel, { color: t.colors.textSoft }]}>GROUPES</Text>
          <View style={[styles.switchRow, { marginBottom: 12 }]}>
            <Text style={{ flex: 1, fontWeight: '500', fontSize: 14, color: t.colors.text }}>Notifications de groupe</Text>
            <Switch value={toggles[2]} onValueChange={() => toggle(2)} trackColor={{ false: t.colors.border, true: t.colors.primary }} thumbColor="#fff" />
          </View>
          <View style={styles.switchRow}>
            <Text style={{ flex: 1, fontWeight: '500', fontSize: 14, color: t.colors.text }}>Mentionné uniquement</Text>
            <Switch value={toggles[3]} onValueChange={() => toggle(3)} trackColor={{ false: t.colors.border, true: t.colors.primary }} thumbColor="#fff" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  section: { borderRadius: 12, padding: 16, marginBottom: 0 },
  sectionLabel: { fontWeight: '600', fontSize: 12, letterSpacing: 0.5, marginBottom: 12 },
  radioRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
