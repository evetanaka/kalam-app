import React from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

export default function AppealScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Contestation</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <Text style={[styles.explanation, { color: t.colors.text }]}>
          Vous pouvez contester cette décision auprès du comité de gouvernance. Décrivez votre situation ci-dessous. En phase 1, un comité humain examine les contestations.
        </Text>

        {/* Slash reference card */}
        <View style={[styles.refCard, { backgroundColor: t.colors.background }]}>
          <Text style={[styles.refId, { color: t.colors.textSoft }]}>SLASH-2026-0412</Text>
          <Text style={[styles.refAmount, { color: t.colors.text }]}>−1,00 € (10 %)</Text>
          <Text style={[styles.refDate, { color: t.colors.textSoft }]}>11 juillet 2026</Text>
        </View>

        {/* Textarea */}
        <TextInput
          style={[styles.textarea, { color: t.colors.text, borderColor: t.colors.border, backgroundColor: t.colors.background }]}
          placeholder="Expliquez pourquoi ce signalement est injuste…"
          placeholderTextColor={t.colors.textSoft}
          multiline
          textAlignVertical="top"
        />

        {/* Attachment button */}
        <Pressable style={[styles.attachButton, { borderColor: t.colors.border }]}>
          <Ionicons name="attach" size={16} color={t.colors.textSoft} />
          <Text style={[styles.attachText, { color: t.colors.textSoft }]}>Ajouter une capture d'écran</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        <Pressable style={[styles.submitButton, { backgroundColor: t.colors.primary }]}>
          <Text style={[styles.submitButtonText, { color: t.colors.card }]}>Envoyer la contestation</Text>
        </Pressable>
        <Text style={[styles.footnote, { color: t.colors.textSoft }]}>
          Réponse sous 48h ouvrées
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 17 },
  content: { paddingHorizontal: 20 },
  explanation: { fontSize: 14, lineHeight: 21, marginTop: 16 },
  refCard: { borderRadius: 12, padding: 16, marginTop: 16 },
  refId: { fontFamily: 'monospace', fontSize: 12 },
  refAmount: { fontWeight: '600', fontSize: 15, marginTop: 4 },
  refDate: { fontSize: 12, marginTop: 4 },
  textarea: { height: 140, marginTop: 24, fontSize: 14, lineHeight: 21, borderWidth: 1, borderRadius: 8, padding: 12 },
  attachButton: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderStyle: 'dashed', borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12 },
  attachText: { fontWeight: '600', fontSize: 14 },
  bottom: { padding: 20, paddingBottom: 24 },
  submitButton: { height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { fontWeight: '600', fontSize: 15 },
  footnote: { fontSize: 12, textAlign: 'center', marginTop: 12 },
});
