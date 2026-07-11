import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { Ionicons } from '@expo/vector-icons';

export default function Redeposit() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: t.colors.warningLight }]}>
          <Ionicons name="shield" size={48} color={t.colors.danger} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: t.colors.danger }]}>
          Votre compte a été exclu
        </Text>

        {/* Explanation */}
        <Text style={[styles.explanation, { color: t.colors.text }]}>
          Suite à des signalements multiples confirmés, votre dépôt a été intégralement slashé. Pour ré-émettre des messages, un nouveau dépôt majoré est requis.
        </Text>

        {/* Required amount card */}
        <View style={[styles.amountCard, { backgroundColor: t.colors.warningLight }]}>
          <Text style={[styles.amountLabel, { color: t.colors.textSoft }]}>
            Nouveau dépôt requis
          </Text>
          <Text style={[styles.amountValue, { color: t.colors.primaryDeep }]}>
            30,00 €{' '}
            <Text style={[styles.amountNote, { color: t.colors.textSoft }]}>
              (3× le montant standard)
            </Text>
          </Text>
        </View>

        <Text style={[styles.footnote, { color: t.colors.textSoft }]}>
          Le montant majoré protège le réseau contre les récidives.
        </Text>

        {/* Buttons */}
        <Pressable style={[styles.primaryButton, { backgroundColor: t.colors.green }]}>
          <Text style={[styles.primaryButtonText, { color: t.colors.background }]}>
            Redéposer
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton}>
          <Text style={[styles.secondaryButtonText, { color: t.colors.textSoft }]}>
            Quitter Kalam
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  iconCircle: {
    marginTop: '20%',
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 24,
  },
  explanation: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 16,
  },
  amountCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  amountValue: {
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 26,
  },
  amountNote: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
  },
  footnote: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 8,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    marginTop: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    width: '100%',
    height: 44,
    marginTop: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
