import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddContactScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Ajouter un contact</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={{ paddingHorizontal: 20, flex: 1 }}>
        {/* .kalam input */}
        <View style={[styles.inputRow, { backgroundColor: t.colors.card, borderColor: t.colors.border }]}>
          <TextInput
            placeholder="nom"
            placeholderTextColor={t.colors.textSoft}
            style={{ flex: 1, fontSize: 14, color: t.colors.text }}
          />
          <Text style={{ fontFamily: 'JetBrainsMono', fontWeight: '500', fontSize: 15, color: t.colors.primary }}>.kalam</Text>
        </View>

        {/* Search result */}
        <View style={[styles.resultCard, { backgroundColor: t.colors.background, borderColor: t.colors.border }]}>
          <View style={[styles.resultAvatar, { backgroundColor: t.colors.pale }]}>
            <Text style={{ fontWeight: '600', fontSize: 18, color: t.colors.primaryDeep }}>S</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '500', fontSize: 15, color: t.colors.text }}>Sara Idrissi</Text>
            <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 13, color: t.colors.textSoft }}>sara.kalam</Text>
          </View>
          <Pressable style={[styles.addBtn, { backgroundColor: t.colors.primary }]}>
            <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.background }}>Ajouter</Text>
          </Pressable>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <View style={[styles.separatorLine, { backgroundColor: t.colors.border }]} />
          <Text style={{ fontSize: 13, color: t.colors.textSoft }}>ou</Text>
          <View style={[styles.separatorLine, { backgroundColor: t.colors.border }]} />
        </View>

        {/* QR scanner */}
        <Pressable style={[styles.qrCard, { backgroundColor: t.colors.card }]}>
          <View style={[styles.qrIcon, { backgroundColor: t.colors.pale }]}>
            <Ionicons name="qr-code" size={22} color={t.colors.primaryDeep} />
          </View>
          <View>
            <Text style={{ fontWeight: '500', fontSize: 15, color: t.colors.text }}>Scanner un QR code</Text>
            <Text style={{ fontSize: 13, color: t.colors.textSoft, marginTop: 2 }}>Scannez le QR code de votre contact</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 0.5, marginTop: 50, gap: 12 },
  headerTitle: { fontWeight: '700', fontSize: 17, flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, height: 52, paddingHorizontal: 16, marginTop: 16, borderWidth: 1.5 },
  resultCard: { borderRadius: 8, padding: 16, marginTop: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultAvatar: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtn: { borderRadius: 999, paddingHorizontal: 16, height: 44, alignItems: 'center', justifyContent: 'center' },
  separator: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  separatorLine: { flex: 1, height: 0.5 },
  qrCard: { borderRadius: 8, padding: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
