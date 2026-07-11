import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Profil</Text>
        <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.primary, opacity: 0.5 }}>Enregistrer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.avatar, { backgroundColor: t.colors.primaryDeep }]}>
            <Text style={{ fontWeight: '700', fontSize: 36, color: t.colors.background }}>R</Text>
          </View>
        </View>

        {/* Name input */}
        <TextInput
          defaultValue="Réda Berrehili"
          style={[styles.nameInput, { backgroundColor: t.colors.background, color: t.colors.primaryDeep }]}
        />

        {/* .kalam handle */}
        <Text style={{ textAlign: 'center', marginTop: 8, fontFamily: 'JetBrainsMono', fontWeight: '500', fontSize: 15, color: t.colors.primary }}>réda.kalam</Text>

        {/* Status */}
        <View style={{ marginTop: 16, width: '100%' }}>
          <TextInput
            defaultValue="Disponible pour discuter 💬"
            maxLength={140}
            multiline
            style={[styles.statusInput, { backgroundColor: t.colors.background, color: t.colors.text }]}
          />
          <Text style={[styles.charCount, { color: t.colors.textSoft }]}>27/140</Text>
        </View>

        {/* QR Code section */}
        <View style={[styles.qrSection, { backgroundColor: t.colors.background }]}>
          <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.text, marginBottom: 12 }}>Mon QR code</Text>
          <View style={[styles.qrPlaceholder, { backgroundColor: t.colors.card }]}>
            <Ionicons name="qr-code" size={80} color={t.colors.primaryDeep} />
          </View>
          <Pressable style={[styles.shareBtn, { backgroundColor: t.colors.pale }]}>
            <Ionicons name="share-outline" size={14} color={t.colors.primaryDeep} />
            <Text style={{ fontWeight: '600', fontSize: 15, color: t.colors.primaryDeep }}>Partager mon QR</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  avatar: { width: 96, height: 96, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nameInput: { marginTop: 16, width: '100%', height: 48, fontWeight: '600', fontSize: 15, borderRadius: 6, paddingHorizontal: 16, textAlign: 'center' },
  statusInput: { width: '100%', fontSize: 14, borderRadius: 6, padding: 12, paddingHorizontal: 16, height: 72, textAlignVertical: 'top' },
  charCount: { position: 'absolute', bottom: 8, right: 12, fontFamily: 'JetBrainsMono', fontSize: 12 },
  qrSection: { marginTop: 24, width: '100%', borderRadius: 10, padding: 16, alignItems: 'center' },
  qrPlaceholder: { width: 120, height: 120, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  shareBtn: { marginTop: 12, borderRadius: 999, height: 44, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
