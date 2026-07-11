import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const devices = [
  { icon: 'phone-portrait' as const, name: 'iPhone 15 Pro', date: '3 juil. 2026', current: true },
  { icon: 'laptop' as const, name: 'MacBook Pro', date: '5 juil. 2026', current: false },
  { icon: 'desktop' as const, name: 'iMac Bureau', date: '10 juil. 2026', current: false },
];

export default function DevicesScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Appareils liés</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ marginTop: 16 }}>
          {devices.map((d, i) => (
            <View key={i} style={[styles.deviceCard, { backgroundColor: t.colors.background }]}>
              <Ionicons name={d.icon} size={24} color={t.colors.primaryDeep} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.text }}>{d.name}</Text>
                  {d.current && (
                    <View style={[styles.currentBadge, { backgroundColor: t.colors.pale }]}>
                      <Text style={{ fontWeight: '600', fontSize: 11, color: t.colors.primary }}>Principal</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 12, color: t.colors.textSoft, marginTop: 4 }}>
                  {d.current ? 'Cet appareil' : `Lié le ${d.date}`}
                </Text>
              </View>
              {!d.current && (
                <Pressable>
                  <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.danger }}>Révoquer</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <Pressable style={[styles.linkBtn, { backgroundColor: t.colors.primary }]}>
          <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.background }}>Lier un nouvel appareil</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  deviceCard: { borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  currentBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  linkBtn: { marginTop: 24, width: '100%', height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
