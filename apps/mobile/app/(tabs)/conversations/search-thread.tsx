import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const results = [
  { from: 'Amine', text: "J'ai parlé au proprio ce matin. Il est OK pour le 3-6-9 avec un mois de dépôt", time: '10:03', isMe: false },
  { from: 'Réda', text: 'Excellent ! Nadir peut regarder le bail ?', time: '10:15', isMe: true },
  { from: 'Amine', text: 'Le proprio demande 2 500 €/mois charges comprises', time: '09:20', isMe: false },
];

const searchTerm = 'proprio';

function highlightParts(text: string, term: string) {
  const parts: { text: string; highlight: boolean }[] = [];
  const regex = new RegExp(`(${term})`, 'gi');
  let last = 0;
  let match;
  const r = new RegExp(regex);
  while ((match = r.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), highlight: false });
    parts.push({ text: match[1], highlight: true });
    last = match.index + match[1].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), highlight: false });
  return parts;
}

export default function SearchThread() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      {/* Search header */}
      <View style={[styles.searchHeader, { backgroundColor: t.colors.card, borderBottomColor: t.colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: t.colors.background }]}>
          <Ionicons name="search" size={14} color={t.colors.textSoft} />
          <TextInput
            style={[styles.searchInput, { color: t.colors.text }]}
            defaultValue="proprio"
            placeholderTextColor={t.colors.textSoft}
          />
        </View>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.cancelText, { color: t.colors.primary }]}>Annuler</Text>
        </Pressable>
      </View>

      {/* Results counter + nav */}
      <View style={[styles.resultsBar, { backgroundColor: t.colors.card, borderBottomColor: t.colors.border }]}>
        <Text style={[styles.resultsCount, { color: t.colors.textSoft }]}>2 / 3 résultats</Text>
        <View style={styles.navArrows}>
          <Pressable>
            <Ionicons name="chevron-up" size={18} color={t.colors.primaryDeep} />
          </Pressable>
          <Pressable>
            <Ionicons name="chevron-down" size={18} color={t.colors.primaryDeep} />
          </Pressable>
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messages}>
        {/* Date separator */}
        <View style={styles.dateSep}>
          <Text style={[styles.dateText, { color: t.colors.textSoft, backgroundColor: t.colors.background }]}>
            Aujourd'hui
          </Text>
        </View>

        {results.slice(0, 2).map((m, i) => (
          <View key={i} style={[styles.msgRow, { justifyContent: m.isMe ? 'flex-end' : 'flex-start' }]}>
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: m.isMe ? t.colors.accentLight : t.colors.card,
                  borderBottomRightRadius: m.isMe ? 2 : 12,
                  borderBottomLeftRadius: m.isMe ? 12 : 2,
                },
              ]}
            >
              {!m.isMe && <Text style={[styles.bubbleName, { color: t.colors.primary }]}>{m.from}</Text>}
              <Text style={[styles.bubbleText, { color: t.colors.text }]}>
                {highlightParts(m.text, searchTerm).map((p, j) =>
                  p.highlight ? (
                    <Text key={j} style={[styles.highlight, { backgroundColor: t.colors.accent }]}>
                      {p.text}
                    </Text>
                  ) : (
                    <Text key={j}>{p.text}</Text>
                  )
                )}
              </Text>
              <View style={styles.bubbleMeta}>
                <Text style={[styles.bubbleTime, { color: t.colors.textSoft }]}>{m.time}</Text>
                {m.isMe && <Ionicons name="checkmark-done" size={11} color={t.colors.primary} />}
              </View>
            </View>
          </View>
        ))}

        {/* Second date */}
        <View style={styles.dateSep}>
          <Text style={[styles.dateText, { color: t.colors.textSoft, backgroundColor: t.colors.background }]}>
            Lundi 7 juillet
          </Text>
        </View>

        <View style={[styles.msgRow, { justifyContent: 'flex-start' }]}>
          <View style={[styles.bubble, { backgroundColor: t.colors.card, borderBottomLeftRadius: 2 }]}>
            <Text style={[styles.bubbleName, { color: t.colors.primary }]}>Amine</Text>
            <Text style={[styles.bubbleText, { color: t.colors.text }]}>
              {highlightParts(results[2].text, searchTerm).map((p, j) =>
                p.highlight ? (
                  <Text key={j} style={[styles.highlight, { backgroundColor: t.colors.accent }]}>
                    {p.text}
                  </Text>
                ) : (
                  <Text key={j}>{p.text}</Text>
                )
              )}
            </Text>
            <View style={styles.bubbleMeta}>
              <Text style={[styles.bubbleTime, { color: t.colors.textSoft }]}>09:20</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: { height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 0.5 },
  searchBox: { flex: 1, height: 40, borderRadius: 6, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  cancelText: { fontWeight: '500', fontSize: 14 },
  resultsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 0.5 },
  resultsCount: { fontWeight: '500', fontSize: 12 },
  navArrows: { flexDirection: 'row', gap: 12 },
  messages: { flex: 1, paddingTop: 8 },
  dateSep: { alignItems: 'center', paddingVertical: 12 },
  dateText: { fontWeight: '500', fontSize: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  msgRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 3 },
  bubble: { maxWidth: '75%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  bubbleName: { fontWeight: '600', fontSize: 13, marginBottom: 2 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  highlight: { borderRadius: 3, paddingHorizontal: 2 },
  bubbleMeta: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 2 },
  bubbleTime: { fontFamily: 'JetBrains Mono', fontSize: 11 },
});
