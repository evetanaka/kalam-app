import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

const guardians = [
  { name: 'Amine', handle: 'amine.kalam', filled: true },
  { name: 'Yassine', handle: 'yassine.kalam', filled: true },
  { name: null, handle: null, filled: false },
];

export default function RecoveryContactsScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { backgroundColor: t.colors.background, borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Récupération</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.description, { color: t.colors.text }]}>
          Choisissez 3 contacts de confiance qui pourront vous aider à récupérer votre compte si
          vous perdez l'accès. 2 sur 3 devront approuver.
        </Text>

        {guardians.map((g, i) => (
          <View key={i} style={[styles.guardianCard, { backgroundColor: t.colors.background }]}>
            {g.filled ? (
              <>
                <View style={[styles.avatar, { backgroundColor: t.colors.pale }]}>
                  <Text style={[styles.avatarText, { color: t.colors.primaryDeep }]}>{g.name![0]}</Text>
                </View>
                <View style={styles.nameCol}>
                  <Text style={[styles.name, { color: t.colors.text }]}>{g.name}</Text>
                  <Text style={[styles.handle, { color: t.colors.accent }]}>{g.handle}</Text>
                </View>
                <Pressable>
                  <Text style={[styles.removeText, { color: t.colors.textSoft }]}>Retirer</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={[styles.emptyAvatar, { borderColor: t.colors.border }]}>
                  <Ionicons name="add" size={20} color={t.colors.textSoft} />
                </View>
                <Pressable>
                  <Text style={[styles.addText, { color: t.colors.accent }]}>Ajouter un gardien</Text>
                </Pressable>
              </>
            )}
          </View>
        ))}

        <Text style={[styles.counter, { color: t.colors.textSoft }]}>
          2 / 3 gardiens configurés
        </Text>

        <Text style={[styles.securityNote, { color: t.colors.textSoft }]}>
          Délai de sécurité : 24 heures après l'approbation de 2 gardiens. Seuls vos gardiens
          peuvent approuver, pas l'équipe Kalam.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, borderBottomWidth: 0.5,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 17 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  description: { marginTop: 16, fontSize: 14, lineHeight: 21 },
  guardianCard: {
    borderRadius: 12, padding: 16, marginTop: 8,
    flexDirection: 'row', alignItems: 'center',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontWeight: '700', fontSize: 18 },
  nameCol: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '600', fontSize: 15 },
  handle: { fontSize: 12, marginTop: 4 },
  removeText: { fontWeight: '500', fontSize: 14 },
  emptyAvatar: {
    width: 44, height: 44, borderRadius: 11,
    borderWidth: 2, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  addText: { marginLeft: 12, fontWeight: '500', fontSize: 14 },
  counter: { marginTop: 12, fontWeight: '500', fontSize: 14 },
  securityNote: { marginTop: 24, fontSize: 12, lineHeight: 17 },
});
