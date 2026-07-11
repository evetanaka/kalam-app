import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const { theme: t } = useTheme();
  return (
    <Pressable onPress={onToggle} style={[styles.toggleTrack, { backgroundColor: on ? t.colors.primary : t.colors.border }]}>
      <View style={[styles.toggleThumb, { left: on ? 23 : 3 }]} />
    </Pressable>
  );
}

function RadioItem({ label, hint, selected, onPress }: { label: string; hint: string; selected: boolean; onPress: () => void }) {
  const { theme: t } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.radioRow, { borderBottomColor: t.colors.border }]}>
      <View style={[styles.radioOuter, { borderColor: selected ? t.colors.primary : t.colors.border }]}>
        {selected && <View style={[styles.radioInner, { backgroundColor: t.colors.primary }]} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.radioLabel, { color: t.colors.text }]}>{label}</Text>
        <Text style={[styles.radioHint, { color: t.colors.textSoft }]}>{hint}</Text>
      </View>
    </Pressable>
  );
}

function ToggleRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  const { theme: t } = useTheme();
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: t.colors.text }]}>{label}</Text>
      <Toggle on={on} onToggle={onToggle} />
    </View>
  );
}

export default function NotificationsScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState(0);
  const [toggles, setToggles] = useState([true, true, true, false]);
  const toggle = (i: number) => setToggles(prev => prev.map((v, j) => (j === i ? !v : v)));

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mode de notification */}
        <View style={[styles.card, { backgroundColor: t.colors.card }]}>
          <Text style={[styles.sectionLabel, { color: t.colors.textSoft }]}>MODE DE NOTIFICATION</Text>
          <RadioItem label="Standard (APNs / FCM)" hint="Existence d'une activité visible par Apple/Google, pas le contenu." selected={mode === 0} onPress={() => setMode(0)} />
          <RadioItem label="UnifiedPush (Android)" hint="Aucune fuite vers Google." selected={mode === 1} onPress={() => setMode(1)} />
          <RadioItem label="Polling" hint="Parano maximale, impact batterie." selected={mode === 2} onPress={() => setMode(2)} />
        </View>

        {/* Sons */}
        <View style={[styles.card, { backgroundColor: t.colors.card }]}>
          <Text style={[styles.sectionLabel, { color: t.colors.textSoft }]}>SONS</Text>
          <ToggleRow label="Son de message" on={toggles[0]} onToggle={() => toggle(0)} />
        </View>

        {/* Conversations */}
        <View style={[styles.card, { backgroundColor: t.colors.card }]}>
          <Text style={[styles.sectionLabel, { color: t.colors.textSoft }]}>CONVERSATIONS</Text>
          <ToggleRow label="Aperçu du message" on={toggles[1]} onToggle={() => toggle(1)} />
        </View>

        {/* Groupes */}
        <View style={[styles.card, { backgroundColor: t.colors.card }]}>
          <Text style={[styles.sectionLabel, { color: t.colors.textSoft }]}>GROUPES</Text>
          <ToggleRow label="Notifications de groupe" on={toggles[2]} onToggle={() => toggle(2)} />
          <View style={{ height: 12 }} />
          <ToggleRow label="Mentionné uniquement" on={toggles[3]} onToggle={() => toggle(3)} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 17 },
  content: { padding: 20, paddingBottom: 32, gap: 8 },
  card: { borderRadius: 12, padding: 16 },
  sectionLabel: { fontWeight: '600', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  radioRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontWeight: '500', fontSize: 14 },
  radioHint: { marginTop: 4, fontSize: 12, fontStyle: 'italic' },
  toggleTrack: { width: 48, height: 28, borderRadius: 14, justifyContent: 'center' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', position: 'absolute', top: 3, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { flex: 1, fontWeight: '500', fontSize: 14, marginRight: 16 },
});
