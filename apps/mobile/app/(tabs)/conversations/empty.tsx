import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const actions = [
  { icon: 'search' as const, label: 'Trouver des contacts' },
  { icon: 'gift' as const, label: 'Inviter des amis' },
  { icon: 'chatbubble' as const, label: "Écrire à l'équipe Kalam" },
];

export default function EmptyConversations() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Conversations</Text>
        <View style={styles.headerRight}>
          <Pressable>
            <Ionicons name="search" size={22} color={t.colors.primaryDeep} />
          </Pressable>
          <Pressable>
            <Ionicons name="ellipsis-vertical" size={22} color={t.colors.primaryDeep} />
          </Pressable>
        </View>
      </View>

      {/* Empty state */}
      <View style={styles.center}>
        <View style={[styles.illustration, { backgroundColor: t.colors.pale }]}>
          <Ionicons name="chatbubbles" size={36} color={t.colors.primary} />
          <Ionicons name="lock-closed" size={36} color={t.colors.accent} />
        </View>

        <Text style={[styles.emptyTitle, { color: t.colors.primaryDeep }]}>
          Vos conversations sont prêtes
        </Text>
        <Text style={[styles.emptyDesc, { color: t.colors.textSoft }]}>
          Chiffrées de bout en bout. Vos messages ne sont que sur vos téléphones.
        </Text>

        {/* CTA cards */}
        {actions.map((a, i) => (
          <Pressable
            key={i}
            style={[styles.ctaCard, { backgroundColor: t.colors.card, borderColor: t.colors.border }]}
          >
            <Ionicons name={a.icon} size={20} color={t.colors.primary} />
            <Text style={[styles.ctaLabel, { color: t.colors.text }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* FAB */}
      <Pressable style={[styles.fab, { backgroundColor: t.colors.primary }]}>
        <Ionicons name="create" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 0.5 },
  headerTitle: { fontWeight: '700', fontSize: 17 },
  headerRight: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  illustration: { width: 96, height: 96, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: 0.8 },
  emptyTitle: { fontWeight: '600', fontSize: 15, marginTop: 24, textAlign: 'center' },
  emptyDesc: { fontSize: 14, marginTop: 8, textAlign: 'center', maxWidth: 260, lineHeight: 21 },
  ctaCard: { width: '100%', marginTop: 8, borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaLabel: { fontWeight: '500', fontSize: 14 },
  fab: { position: 'absolute', bottom: 72, right: 16, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
});
