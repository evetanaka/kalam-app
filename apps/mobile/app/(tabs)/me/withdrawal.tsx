import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

export default function WithdrawalScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [destination, setDestination] = useState<'iban' | 'crypto'>('iban');

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Récupérer mon dépôt</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Icon */}
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Ionicons name="business" size={48} color={t.colors.primaryDeep} />
        </View>

        <Text style={[styles.title, { color: t.colors.text }]}>Récupérez votre dépôt</Text>
        <Text style={[styles.amount, { color: t.colors.primaryDeep }]}>10,00 € disponibles</Text>

        <Text style={[styles.explanation, { color: t.colors.text }]}>
          Le retrait prend 7 jours — le temps que d'éventuels signalements aboutissent. Pendant cette période, votre compte sera en lecture seule.
        </Text>

        {/* Destination radios */}
        <View style={{ marginTop: 24 }}>
          <Pressable onPress={() => setDestination('iban')} style={[styles.radioRow, { borderBottomColor: t.colors.border }]}>
            <View style={[styles.radioOuter, { borderColor: destination === 'iban' ? t.colors.primary : t.colors.border }]}>
              {destination === 'iban' && <View style={[styles.radioInner, { backgroundColor: t.colors.primary }]} />}
            </View>
            <Text style={[styles.radioLabel, { color: t.colors.text }]}>Vers mon compte bancaire (IBAN)</Text>
          </Pressable>

          {destination === 'iban' && (
            <View style={{ paddingLeft: 30, paddingVertical: 8 }}>
              <TextInput
                style={[styles.ibanInput, { color: t.colors.text, borderColor: t.colors.border, backgroundColor: t.colors.background }]}
                value="FR76 3000 1007 9412 3456 7890 185"
                editable={false}
              />
            </View>
          )}

          <Pressable onPress={() => setDestination('crypto')} style={styles.radioRow}>
            <View style={[styles.radioOuter, { borderColor: destination === 'crypto' ? t.colors.primary : t.colors.border }]}>
              {destination === 'crypto' && <View style={[styles.radioInner, { backgroundColor: t.colors.primary }]} />}
            </View>
            <Text style={[styles.radioLabel, { color: t.colors.text }]}>Vers une adresse crypto</Text>
          </Pressable>
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: t.colors.background }]}>
          <Text style={[styles.summaryLine, { color: t.colors.text }]}>Montant : 10,00 €</Text>
          <Text style={[styles.summaryLine, { color: t.colors.text, marginTop: 4 }]}>Délai : 7 jours</Text>
          <Text style={[styles.summaryLine, { color: t.colors.text, marginTop: 4 }]}>Destination : Compte bancaire (IBAN)</Text>
        </View>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        <Pressable style={[styles.confirmButton, { borderColor: t.colors.danger }]}>
          <Text style={[styles.confirmButtonText, { color: t.colors.danger }]}>Confirmer le retrait</Text>
        </Pressable>
        <Text style={[styles.footnote, { color: t.colors.textSoft }]}>
          Aucune rétention — la facilité du départ est notre meilleur argument.
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
  title: { fontWeight: '700', fontSize: 22, textAlign: 'center', marginTop: 16 },
  amount: { fontWeight: '700', fontSize: 28, textAlign: 'center', marginTop: 8 },
  explanation: { fontSize: 14, lineHeight: 21, marginTop: 16 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontSize: 14 },
  ibanInput: { height: 48, paddingHorizontal: 12, fontFamily: 'monospace', fontSize: 14, borderWidth: 1, borderRadius: 6 },
  summaryCard: { borderRadius: 12, padding: 16, marginTop: 24 },
  summaryLine: { fontSize: 14 },
  bottom: { padding: 20, paddingBottom: 24 },
  confirmButton: { height: 52, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { fontWeight: '600', fontSize: 15 },
  footnote: { fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 12 },
});
