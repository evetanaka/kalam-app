import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const reasonsList = [
  'Spam',
  'Harcèlement',
  'Contenu inapproprié',
  "Usurpation d'identité",
  'Arnaque / fraude',
  'Autre',
];

export default function Report() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState(1); // Harcèlement
  const [details, setDetails] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Signaler</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: t.colors.textSoft }]}>Signaler mehdi.kalam</Text>
        <Text style={[styles.title, { color: t.colors.primaryDeep }]}>Motif du signalement</Text>
        <Text style={[styles.info, { color: t.colors.textSoft }]}>
          50% de la mise sera brûlée, 50% vous sera versée.
        </Text>

        {/* Reasons */}
        <View style={styles.reasons}>
          {reasonsList.map((label, i) => {
            const active = i === selected;
            return (
              <Pressable
                key={i}
                onPress={() => setSelected(i)}
                style={[
                  styles.reasonRow,
                  {
                    backgroundColor: active ? t.colors.pale : t.colors.background,
                    borderColor: active ? t.colors.primary : 'transparent',
                    borderWidth: active ? 2 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.radio,
                    active
                      ? { borderWidth: 6, borderColor: t.colors.primary }
                      : { borderWidth: 2, borderColor: t.colors.textSoft },
                    { backgroundColor: t.colors.card },
                  ]}
                />
                <Text style={[styles.reasonText, { color: t.colors.text }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Details */}
        <View style={[styles.textareaBox, { backgroundColor: t.colors.background, borderColor: t.colors.border }]}>
          <TextInput
            style={[styles.textarea, { color: t.colors.text }]}
            placeholder="Détails supplémentaires (optionnel)…"
            placeholderTextColor={t.colors.textSoft}
            multiline
            value={details}
            onChangeText={setDetails}
          />
        </View>
      </ScrollView>

      {/* Submit */}
      <View style={styles.footer}>
        <Pressable style={[styles.submitBtn, { backgroundColor: t.colors.danger }]}>
          <Text style={styles.submitText}>Confirmer le signalement</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 0.5 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  subtitle: { fontSize: 14, marginTop: 16 },
  title: { fontWeight: '700', fontSize: 22, marginTop: 8 },
  info: { fontSize: 14, marginTop: 8 },
  reasons: { marginTop: 16, gap: 8 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  radio: { width: 22, height: 22, borderRadius: 11 },
  reasonText: { fontWeight: '500', fontSize: 15 },
  textareaBox: { marginTop: 16, padding: 12, borderRadius: 6, borderWidth: 1, minHeight: 80 },
  textarea: { fontSize: 14 },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  submitBtn: { borderRadius: 999, height: 52, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
