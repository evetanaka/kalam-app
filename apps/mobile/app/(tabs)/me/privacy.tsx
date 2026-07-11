import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const items = [
  { label: 'Confirmations de lecture', hint: 'Si désactivé, vous ne verrez pas non plus les leurs.' },
  { label: 'Dernière connexion visible', hint: 'Si masqué, vous ne verrez pas la leur non plus.' },
  { label: 'Notifications aveugles', hint: 'Les notifications ne montrent ni l\'expéditeur ni l\'aperçu.' },
  { label: 'Mode strict appareil-à-appareil', hint: 'Les messages passent directement, sans tampon. Livraison uniquement quand les deux sont en ligne.' },
  { label: 'Messages éphémères par défaut', hint: 'Toutes les nouvelles conversations auront des messages éphémères de 7 jours.' },
];

const selectRows = [
  { label: 'Photo de profil visible par', hint: 'Qui peut voir votre photo.', value: 'Tout le monde' },
  { label: 'Statut visible par', hint: 'Qui peut voir votre statut.', value: 'Tout le monde' },
];

export default function PrivacyScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [toggles, setToggles] = useState([true, true, false, false, false]);
  const toggle = (i: number) => setToggles(prev => prev.map((v, j) => j === i ? !v : v));

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Confidentialité</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
        {items.map((item, i) => (
          <View key={i} style={[styles.toggleRow, { borderBottomColor: t.colors.border }]}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.text }}>{item.label}</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: t.colors.textSoft, fontStyle: 'italic' }}>{item.hint}</Text>
            </View>
            <Switch
              value={toggles[i]}
              onValueChange={() => toggle(i)}
              trackColor={{ false: t.colors.border, true: t.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        ))}

        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          {selectRows.map((row, i) => (
            <Pressable key={i} style={[styles.selectRow, { backgroundColor: t.colors.background, borderRadius: 12, marginBottom: 8 }]}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.text }}>{row.label}</Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: t.colors.textSoft, fontStyle: 'italic' }}>{row.hint}</Text>
              </View>
              <Text style={{ fontSize: 14, color: t.colors.primary }}>{row.value} →</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  selectRow: { padding: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
});
