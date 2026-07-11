import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const quickAmounts = [5, 10, 20, 50];

export default function SendPayment() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState(10);
  const [note, setNote] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      {/* Top spacer (simulating bottom sheet over conversation) */}
      <View style={{ flex: 0.4, backgroundColor: t.colors.background }} />

      <View style={[styles.sheet, { backgroundColor: t.colors.card }]}>
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: t.colors.border }]} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: t.colors.text }]}>Envoyer à Amine</Text>

        {/* Amount */}
        <View style={styles.amountRow}>
          <Text style={[styles.currency, { color: t.colors.textSoft }]}>€</Text>
          <Text style={[styles.amount, { color: t.colors.primaryDeep }]}>
            {selected},00
          </Text>
        </View>

        {/* Balance */}
        <Text style={[styles.balance, { color: t.colors.textSoft }]}>Solde : 9,93 €</Text>

        {/* Quick amounts */}
        <View style={styles.quickRow}>
          {quickAmounts.map((a) => (
            <Pressable
              key={a}
              onPress={() => setSelected(a)}
              style={[
                styles.quickBtn,
                {
                  backgroundColor: a === selected ? t.colors.pale : t.colors.background,
                  borderColor: a === selected ? t.colors.primary : t.colors.border,
                  borderWidth: a === selected ? 2 : 1,
                },
              ]}
            >
              <Text style={[styles.quickText, { color: t.colors.primaryDeep }]}>{a} €</Text>
            </Pressable>
          ))}
        </View>

        {/* Note */}
        <View style={[styles.noteBox, { backgroundColor: t.colors.background, borderColor: t.colors.border }]}>
          <TextInput
            style={[styles.noteInput, { color: t.colors.text }]}
            placeholder="Ajouter une note…"
            placeholderTextColor={t.colors.textSoft}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <View style={{ flex: 1 }} />

        {/* Send button */}
        <Pressable style={[styles.sendBtn, { backgroundColor: t.colors.primary }]}>
          <Ionicons name="scan" size={20} color="#fff" />
          <Text style={styles.sendText}>Envoyer · Face ID</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sheet: { flex: 1, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20 },
  handleWrap: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  title: { fontWeight: '700', fontSize: 22 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginTop: 24, gap: 4 },
  currency: { fontWeight: '600', fontSize: 32 },
  amount: { fontWeight: '800', fontSize: 48, letterSpacing: -0.72 },
  balance: { textAlign: 'center', fontSize: 14, marginTop: 8 },
  quickRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 16 },
  quickBtn: { width: 56, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quickText: { fontWeight: '600', fontSize: 16 },
  noteBox: { marginTop: 16, padding: 16, borderRadius: 6, borderWidth: 1 },
  noteInput: { fontSize: 14 },
  sendBtn: { borderRadius: 999, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 },
  sendText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
