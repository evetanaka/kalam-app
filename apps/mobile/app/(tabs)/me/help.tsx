import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

const faqData = [
  { category: 'Premiers pas', questions: [
    { q: 'Comment fonctionne le dépôt de 10 € ?', a: 'Le dépôt de 10 € sert de garantie anti-spam. 80% est verrouillé comme plancher, le reste sert de réserve pour payer les frais de messages reçus d\'inconnus. Si vous êtes un bon acteur, ce dépôt est quasi-inépuisable.' },
    { q: 'Mon argent est-il en sécurité ?', a: 'Oui. Votre dépôt est stocké dans un smart contract audité. Vous pouvez le retirer à tout moment, sous réserve de ne pas avoir de litiges en cours.' },
  ]},
  { category: 'Dépôt et paiements', questions: [
    { q: 'Comment recharger mon dépôt ?', a: 'Allez dans Réglages → Mon dépôt → Recharger. Vous pouvez payer par carte, Apple Pay ou virement SEPA.' },
    { q: 'Que se passe-t-il si ma réserve est épuisée ?', a: 'Vous ne pourrez plus recevoir de messages d\'inconnus tant que votre réserve n\'est pas rechargée. Les contacts existants ne sont pas affectés.' },
  ]},
  { category: 'Sécurité et chiffrement', questions: [
    { q: 'Kalam peut-il lire mes messages ?', a: 'Non. Kalam utilise le chiffrement de bout en bout. Seuls vous et votre correspondant pouvez lire vos messages. Même l\'équipe Kalam n\'y a pas accès.' },
  ]},
  { category: 'Compte et récupération', questions: [
    { q: 'Comment récupérer mon compte ?', a: 'Configurez 3 contacts de récupération (gardiens). Si vous perdez l\'accès, 2 sur 3 devront approuver la récupération. Délai de sécurité : 24h.' },
  ]},
  { category: 'Groupes', questions: [
    { q: 'Quelle est la limite de membres dans un groupe ?', a: '100 membres pour les comptes gratuits, 1 000 pour les abonnés Kalam+.' },
  ]},
  { category: 'Signalement', questions: [
    { q: 'Comment signaler un comportement abusif ?', a: 'Appuyez longuement sur un message → Signaler. Le système de slashing pénalise automatiquement les comptes abusifs.' },
  ]},
];

export default function HelpScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [openCat, setOpenCat] = useState<number | null>(null);
  const [openQ, setOpenQ] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Aide</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: t.colors.card }]}>
          <Ionicons name="search" size={16} color={t.colors.textSoft} />
          <TextInput
            placeholder="Rechercher dans l'aide…"
            placeholderTextColor={t.colors.textSoft}
            style={[styles.searchInput, { color: t.colors.text }]}
          />
        </View>

        {faqData.map((cat, ci) => (
          <View key={ci} style={{ marginBottom: 8 }}>
            <Pressable
              onPress={() => setOpenCat(openCat === ci ? null : ci)}
              style={[styles.catHeader, {
                backgroundColor: t.colors.card,
                borderBottomLeftRadius: openCat === ci ? 0 : 12,
                borderBottomRightRadius: openCat === ci ? 0 : 12,
              }]}
            >
              <Text style={[styles.catTitle, { color: t.colors.text }]}>{cat.category}</Text>
              <Ionicons
                name={openCat === ci ? 'chevron-down' : 'chevron-forward'}
                size={16}
                color={t.colors.textSoft}
              />
            </Pressable>
            {openCat === ci && (
              <View style={[styles.catBody, { backgroundColor: t.colors.card }]}>
                {cat.questions.map((q, qi) => {
                  const key = `${ci}-${qi}`;
                  return (
                    <View key={qi}>
                      <Pressable
                        onPress={() => setOpenQ(openQ === key ? null : key)}
                        style={[styles.questionRow, { borderTopColor: t.colors.border }]}
                      >
                        <Text style={[styles.questionText, { color: t.colors.text }]}>{q.q}</Text>
                        <Text style={{ color: t.colors.textSoft, fontSize: 14 }}>{openQ === key ? '−' : '+'}</Text>
                      </Pressable>
                      {openQ === key && (
                        <Text style={[styles.answerText, { color: t.colors.textSoft }]}>{q.a}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}

        <Pressable style={{ marginTop: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: t.colors.primary }}>Contacter l'équipe Kalam →</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 17 },
  content: { padding: 20, paddingBottom: 32 },
  searchBar: { borderRadius: 6, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 14 },
  catHeader: { borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catTitle: { fontWeight: '600', fontSize: 14 },
  catBody: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: 'hidden' },
  questionRow: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionText: { fontWeight: '600', fontSize: 14, flex: 1, marginRight: 8 },
  answerText: { paddingHorizontal: 20, paddingBottom: 12, fontSize: 14, lineHeight: 21 },
});
