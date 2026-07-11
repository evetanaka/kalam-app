import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const shareOptions = [
  { icon: 'chatbubble' as const, label: 'SMS' },
  { icon: 'logo-whatsapp' as const, label: 'WhatsApp' },
  { icon: 'link' as const, label: 'Copier le lien' },
  { icon: 'share-outline' as const, label: 'Partager' },
];

export default function Invite() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Dimmed top area */}
      <Pressable style={styles.backdrop} onPress={() => router.back()} />

      <View style={[styles.sheet, { backgroundColor: t.colors.card }]}>
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: t.colors.border }]} />
        </View>

        <Text style={[styles.title, { color: t.colors.text }]}>Inviter sur Kalam</Text>
        <Text style={[styles.subtitle, { color: t.colors.textSoft }]}>
          Votre message sera chiffré et attendra leur inscription.
        </Text>

        {/* Share grid */}
        <View style={styles.grid}>
          {shareOptions.map((o, i) => (
            <Pressable key={i} style={[styles.gridItem, { backgroundColor: t.colors.background }]}>
              <Ionicons name={o.icon} size={32} color={t.colors.primaryDeep} />
              <Text style={[styles.gridLabel, { color: t.colors.text }]}>{o.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Message preview */}
        <View style={[styles.preview, { backgroundColor: t.colors.background }]}>
          <Text style={[styles.previewText, { color: t.colors.text }]}>
            reda.kalam t'a écrit un message chiffré. Il ne s'ouvrira que sur ton téléphone. 🔒
          </Text>
          <Text style={[styles.previewLink, { color: t.colors.primary }]}>
            kalam.chat/invite/reda
          </Text>
          <Pressable style={styles.editRow}>
            <Text style={[styles.editText, { color: t.colors.primary }]}>Modifier</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backdrop: { flex: 0.35, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { flex: 1, borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 20 },
  handleWrap: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  title: { fontWeight: '600', fontSize: 15 },
  subtitle: { fontSize: 14, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  gridItem: { width: '47%', alignItems: 'center', gap: 6, padding: 16, borderRadius: 8 },
  gridLabel: { fontSize: 12 },
  preview: { borderRadius: 6, padding: 16, marginTop: 16 },
  previewText: { fontSize: 14, lineHeight: 21 },
  previewLink: { fontFamily: 'JetBrains Mono', fontSize: 13, marginTop: 8 },
  editRow: { alignItems: 'flex-end', marginTop: 8 },
  editText: { fontWeight: '500', fontSize: 13 },
});
