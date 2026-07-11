import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const settingsItems = [
  { icon: 'star' as const, iconColor: 'accent', label: 'Kalam+', badge: 'Nouveau', route: '/me/kalam-plus' },
  { icon: 'gift' as const, iconColor: 'primary', label: 'Invitations et gains', route: null },
  { icon: 'phone-portrait' as const, iconColor: 'text', label: 'Appareils liés', route: '/me/devices' },
  { icon: 'shield-checkmark' as const, iconColor: 'primary', label: 'Contacts de récupération', route: null },
  { icon: 'lock-closed' as const, iconColor: 'text', label: 'Confidentialité', route: '/me/privacy' },
  { icon: 'notifications' as const, iconColor: 'text', label: 'Notifications', route: '/me/settings' },
  { icon: 'server' as const, iconColor: 'text', label: 'Stockage et données', route: null },
  { icon: 'help-circle' as const, iconColor: 'text', label: 'Aide', route: null },
  { icon: 'key' as const, iconColor: 'text', label: 'Export de clé (avancé)', route: null },
];

export default function MeScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { borderBottomColor: t.colors.border, backgroundColor: t.colors.background }]}>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep, textAlign: 'left' }]}>Réglages</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Profile card */}
        <Pressable
          style={[styles.profileCard, { backgroundColor: t.colors.card }]}
          onPress={() => router.push('/me/profile')}
        >
          <View style={[styles.profileAvatar, { backgroundColor: t.colors.pale }]}>
            <Text style={{ fontWeight: '600', fontSize: 24, color: t.colors.primaryDeep }}>RB</Text>
          </View>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 22, color: t.colors.primaryDeep }}>Réda Berrehili</Text>
            <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 12, color: t.colors.primary }}>reda.kalam</Text>
            <Text style={{ fontSize: 12, color: t.colors.textSoft, marginTop: 2 }}>En mode création 🚀</Text>
          </View>
          <Text style={{ color: t.colors.textSoft, fontSize: 18 }}>›</Text>
        </Pressable>

        {/* Deposit card */}
        <Pressable
          style={[styles.depositCard, { backgroundColor: t.colors.card }]}
          onPress={() => router.push('/me/deposit')}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.text }}>Dépôt de garantie</Text>
            <Text style={{ color: t.colors.textSoft, fontSize: 18 }}>›</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <Text style={{ fontWeight: '700', fontSize: 22, color: t.colors.primaryDeep }}>25,00 €</Text>
            <Text style={{ fontSize: 12, color: t.colors.textSoft }}>≈ 29 ans de messages</Text>
          </View>
          <View style={[styles.gauge, { backgroundColor: t.colors.pale }]}>
            <View style={{ height: '100%', width: '82%', backgroundColor: t.colors.primary, borderRadius: 3 }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 12, color: t.colors.textSoft }}>Garantie : 20,00 €</Text>
            <Text style={{ fontSize: 12, color: t.colors.textSoft }}>Réserve : 5,00 €</Text>
          </View>
        </Pressable>

        {/* Settings list */}
        <View style={[styles.settingsList, { backgroundColor: t.colors.card }]}>
          {settingsItems.map((item, i) => (
            <Pressable
              key={i}
              style={[styles.settingsRow, i < settingsItems.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: t.colors.border }]}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <Ionicons name={item.icon} size={20} color={item.iconColor === 'primary' ? t.colors.primary : item.iconColor === 'accent' ? t.colors.accent : t.colors.text} style={{ marginRight: 12 }} />
              <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.text, flex: 1 }}>{item.label}</Text>
              {item.badge && (
                <View style={[styles.badge, { backgroundColor: t.colors.pale }]}>
                  <Text style={{ fontWeight: '600', fontSize: 11, color: t.colors.primary }}>{item.badge}</Text>
                </View>
              )}
              <Text style={{ color: t.colors.textSoft, fontSize: 16 }}>›</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ textAlign: 'center', paddingVertical: 20, fontSize: 12, color: t.colors.textSoft }}>kalam v1.0.0 · build 42</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 0.5, paddingTop: 50 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700' },
  profileCard: { borderRadius: 10, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileAvatar: { width: 64, height: 64, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  depositCard: { borderRadius: 10, padding: 16, marginBottom: 16 },
  gauge: { marginTop: 10, height: 6, borderRadius: 3 },
  settingsList: { borderRadius: 10, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginRight: 8 },
});
