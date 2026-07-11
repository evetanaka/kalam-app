import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ContactDetailScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <View style={[styles.bigAvatar, { backgroundColor: t.colors.pale }]}>
            <Text style={{ fontWeight: '600', fontSize: 32, color: t.colors.primaryDeep }}>A</Text>
          </View>
        </View>

        {/* Name */}
        <Text style={{ textAlign: 'center', marginTop: 12, fontWeight: '700', fontSize: 22, color: t.colors.primaryDeep }}>Amine Haddadi</Text>
        <Text style={{ textAlign: 'center', marginTop: 4, fontFamily: 'JetBrainsMono', fontWeight: '500', fontSize: 15, color: t.colors.primary }}>amine.kalam</Text>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'chatbubble-outline' as const, label: 'Message' },
            { icon: 'call-outline' as const, label: 'Appeler' },
            { icon: 'card-outline' as const, label: 'Payer' },
          ].map((a, i) => (
            <Pressable key={i} style={styles.actionItem}>
              <View style={[styles.actionCircle, { backgroundColor: t.colors.pale }]}>
                <Ionicons name={a.icon} size={20} color={t.colors.primaryDeep} />
              </View>
              <Text style={{ fontSize: 12, color: t.colors.text, marginTop: 6 }}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Encryption card */}
        <View style={[styles.card, { backgroundColor: t.colors.background }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="lock-closed" size={16} color={t.colors.primaryDeep} />
            <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.text }}>Chiffré de bout en bout</Text>
          </View>
          <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.primary, marginTop: 8 }}>Vérifier les clés de sécurité →</Text>
        </View>

        {/* Shared media */}
        <View style={[styles.card, { backgroundColor: t.colors.background, marginTop: 8 }]}>
          <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.primaryDeep }}>Médias partagés</Text>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 10 }}>
            {[t.colors.pale, '#D4E8DA', '#B8D9C4'].map((bg, i) => (
              <View key={i} style={{ flex: 1, height: 80, borderRadius: 4, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="camera" size={16} color={t.colors.textSoft} />
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 12, color: t.colors.textSoft, marginTop: 8 }}>42 médias</Text>
        </View>

        {/* Common groups */}
        <View style={[styles.card, { backgroundColor: t.colors.background, marginTop: 8 }]}>
          <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.primaryDeep }}>Conversations en commun</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 4, backgroundColor: t.colors.pale, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="people" size={16} color={t.colors.primaryDeep} />
            </View>
            <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.text }}>Dar Society</Text>
          </View>
        </View>

        {/* Danger zone */}
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Pressable style={{ paddingVertical: 12 }}>
            <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.danger }}>Bloquer Amine</Text>
          </Pressable>
          <Pressable style={{ paddingVertical: 12 }}>
            <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.danger }}>Signaler</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 0.5, marginTop: 50 },
  bigAvatar: { width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickActions: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 24 },
  actionItem: { alignItems: 'center', width: 64 },
  actionCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 8, padding: 16, marginTop: 24 },
});
