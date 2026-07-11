import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const contacts = [
  { letter: 'A', items: [{ name: 'Amine Haddadi', kalam: 'amine.kalam', avatar: 'AH' }, { name: 'Aïcha El Fassi', kalam: 'aicha.kalam', avatar: 'AE' }] },
  { letter: 'G', items: [{ name: 'Ghita Bennani', kalam: 'ghita.kalam', avatar: 'GB' }] },
  { letter: 'J', items: [{ name: 'Javier Torres', kalam: 'javier.kalam', avatar: 'JT' }] },
  { letter: 'L', items: [{ name: 'Lucile Lafont', kalam: 'lucile.kalam', avatar: 'LL' }] },
  { letter: 'N', items: [{ name: 'Nadir Berrada', kalam: 'nadir.kalam', avatar: 'NB' }] },
  { letter: 'R', items: [{ name: 'Réda Berrehili', kalam: 'reda.kalam', avatar: 'RB' }, { name: 'Romeo Martini', kalam: 'romeo.kalam', avatar: 'RM' }] },
  { letter: 'Y', items: [{ name: 'Yassine Tamer', kalam: 'yassine.kalam', avatar: 'YT' }] },
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function ContactsScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep, textAlign: 'left' }]}>Contacts</Text>
        <Pressable>
          <Ionicons name="search" size={22} color={t.colors.primaryDeep} />
        </Pressable>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: t.colors.card }]}>
          <Ionicons name="search" size={16} color={t.colors.textSoft} />
          <Text style={{ fontSize: 14, color: t.colors.textSoft }}>Rechercher un contact…</Text>
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        <ScrollView style={{ flex: 1 }}>
          {contacts.map(section => (
            <View key={section.letter}>
              <Text style={[styles.sectionLetter, { color: t.colors.textSoft }]}>{section.letter}</Text>
              {section.items.map((ct, i) => (
                <Pressable
                  key={i}
                  style={[styles.contactRow, { borderBottomColor: t.colors.border }]}
                  onPress={() => router.push('/contacts/contact-detail')}
                >
                  <View style={[styles.avatar, { backgroundColor: t.colors.pale }]}>
                    <Text style={[styles.avatarText, { color: t.colors.primaryDeep }]}>{ct.avatar}</Text>
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={{ fontWeight: '500', fontSize: 14, color: t.colors.text }}>{ct.name}</Text>
                    <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 12, color: t.colors.primary }}>{ct.kalam}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Alpha index */}
        <View style={styles.alphaIndex}>
          {alphabet.map(l => {
            const hasSection = contacts.some(s => s.letter === l);
            return (
              <Text key={l} style={{ fontSize: 10, fontWeight: '600', color: hasSection ? t.colors.primary : t.colors.textSoft, height: 20, textAlignVertical: 'center' }}>
                {l}
              </Text>
            );
          })}
        </View>
      </View>

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: t.colors.primary }]}
        onPress={() => router.push('/contacts/add-contact')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 0.5, paddingTop: 50 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700' },
  searchWrap: { paddingHorizontal: 20, paddingVertical: 8 },
  searchBar: { borderRadius: 6, height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 },
  sectionLetter: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, fontWeight: '600', fontSize: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 0.5 },
  avatar: { width: 44, height: 44, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '600', fontSize: 14 },
  alphaIndex: { width: 20, alignItems: 'center', justifyContent: 'center', paddingRight: 4 },
  fab: { position: 'absolute', bottom: 72, right: 16, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
});
