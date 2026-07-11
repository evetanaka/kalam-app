import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const requests = [
  { name: 'omar42.kalam', stake: '0,50 €', preview: 'Tap pour voir le message' },
  { name: 'sarah-m.kalam', stake: '1,00 €', preview: 'Tap pour voir le message' },
  { name: 'inconnu99.kalam', stake: '0,50 €', preview: 'Tap pour voir le message' },
];

export default function UnknownRequests() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Conversations</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Requests section header */}
        <Pressable style={[styles.sectionHeader, { backgroundColor: t.colors.background }]}>
          <Text style={[styles.sectionTitle, { color: t.colors.textSoft }]}>
            Demandes · {requests.length}
          </Text>
          <Ionicons name="chevron-down" size={12} color={t.colors.textSoft} />
        </Pressable>

        {/* Request cards */}
        {requests.map((r, i) => (
          <View key={i} style={[styles.card, { backgroundColor: t.colors.card, borderColor: t.colors.border }]}>
            <View style={styles.cardRow}>
              <View style={[styles.avatar, { backgroundColor: t.colors.pale }]}>
                <Text style={[styles.avatarText, { color: t.colors.primaryDeep }]}>
                  {r.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardName, { color: t.colors.text }]}>{r.name}</Text>
                <Text style={[styles.cardStake, { color: t.colors.accent }]}>
                  A mis {r.stake} en jeu pour vous écrire
                </Text>
                <Text style={[styles.cardPreview, { color: t.colors.textSoft }]}>{r.preview}</Text>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <Pressable style={[styles.btn, { backgroundColor: t.colors.primary }]}>
                <Text style={styles.btnTextWhite}>Accepter</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnOutline, { borderColor: t.colors.textSoft }]}>
                <Text style={[styles.btnTextOutline, { color: t.colors.textSoft }]}>Refuser</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnOutline, { borderColor: t.colors.danger }]}>
                <Text style={[styles.btnTextOutline, { color: t.colors.danger }]}>Signaler</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* See all */}
        <Pressable style={styles.seeAll}>
          <Text style={[styles.seeAllText, { color: t.colors.primary }]}>
            Voir toutes les demandes (12)
          </Text>
        </Pressable>

        {/* Regular conversation preview */}
        <Text style={[styles.sectionLabel, { color: t.colors.textSoft }]}>CONVERSATIONS</Text>
        <Pressable style={[styles.convRow, { borderBottomColor: t.colors.border }]}>
          <View style={[styles.convAvatar, { backgroundColor: t.colors.pale }]}>
            <Text style={[styles.convAvatarText, { color: t.colors.primaryDeep }]}>AH</Text>
          </View>
          <View style={styles.convContent}>
            <Text style={[styles.convName, { color: t.colors.text }]}>Amine Haddadi</Text>
            <Text style={[styles.convLast, { color: t.colors.textSoft }]}>On se voit demain ?</Text>
          </View>
          <View style={styles.convMeta}>
            <Text style={[styles.convTime, { color: t.colors.primary }]}>14:36</Text>
            <View style={[styles.badge, { backgroundColor: t.colors.primary }]}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, paddingHorizontal: 20, justifyContent: 'center', borderBottomWidth: 0.5 },
  headerTitle: { fontWeight: '700', fontSize: 22 },
  scrollView: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  sectionTitle: { fontWeight: '600', fontSize: 15 },
  card: { marginHorizontal: 20, marginTop: 8, borderRadius: 8, padding: 16, borderWidth: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '600', fontSize: 16 },
  cardContent: { flex: 1 },
  cardName: { fontWeight: '500', fontSize: 14, fontFamily: 'JetBrains Mono' },
  cardStake: { fontWeight: '400', fontSize: 13, marginTop: 2 },
  cardPreview: { fontWeight: '400', fontSize: 13, fontStyle: 'italic', marginTop: 2 },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  btn: { flex: 1, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5 },
  btnTextWhite: { color: '#fff', fontWeight: '600', fontSize: 15 },
  btnTextOutline: { fontWeight: '600', fontSize: 15 },
  seeAll: { paddingVertical: 12, alignItems: 'center' },
  seeAllText: { fontWeight: '500', fontSize: 13 },
  sectionLabel: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, fontWeight: '600', fontSize: 12, textTransform: 'uppercase' },
  convRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 72, borderBottomWidth: 0.5 },
  convAvatar: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  convAvatarText: { fontWeight: '600', fontSize: 18 },
  convContent: { flex: 1, marginLeft: 12 },
  convName: { fontWeight: '600', fontSize: 15 },
  convLast: { fontWeight: '400', fontSize: 14, marginTop: 2 },
  convMeta: { alignItems: 'flex-end' },
  convTime: { fontSize: 12 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 4, paddingHorizontal: 5 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
