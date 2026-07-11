import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import * as Clipboard from 'expo-clipboard';

const MOCK_KEY = 'a3f8c2d1e9b7046f5a2d8c3e1b9f7046d5a2c8e3f1b9074a6d5c2e8f3b19074';

export default function ExportKeyScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [showKey, setShowKey] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!showKey) return;
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowKey(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showKey]);

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card }]}>
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={t.colors.primaryDeep} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.colors.primaryDeep }]}>Export de clé</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Warning */}
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={20} color="#E65100" style={{ marginTop: 2 }} />
          <Text style={[styles.warningText, { color: t.colors.text }]}>
            Avancé — Cette clé donne un contrôle total sur votre compte. Ne la partagez jamais. Ne la stockez pas en ligne.
          </Text>
        </View>

        {!showKey && (
          <Pressable
            onPress={() => setShowKey(true)}
            style={[styles.dangerButton, { borderColor: t.colors.danger }]}
          >
            <Text style={[styles.dangerButtonText, { color: t.colors.danger }]}>Afficher ma clé privée</Text>
          </Pressable>
        )}

        {showKey && (
          <View style={{ marginTop: 16 }}>
            <View style={[styles.keyBox, { backgroundColor: t.colors.background }]}>
              <Text style={[styles.keyText, { color: t.colors.text }]} selectable>
                {MOCK_KEY}
              </Text>
              <View style={styles.copyRow}>
                <Pressable
                  onPress={() => Clipboard.setStringAsync(MOCK_KEY)}
                  style={[styles.copyButton, { backgroundColor: t.colors.textSoft }]}
                >
                  <Text style={[styles.copyButtonText, { color: t.colors.card }]}>Copier</Text>
                </Pressable>
              </View>
            </View>
            <Text style={[styles.timerText, { color: t.colors.textSoft }]}>
              Disparaît dans {countdown}s
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 17 },
  content: { padding: 20, paddingBottom: 32 },
  warningBox: { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  warningText: { flex: 1, fontWeight: '500', fontSize: 14, lineHeight: 21 },
  dangerButton: { marginTop: 24, height: 52, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dangerButtonText: { fontWeight: '600', fontSize: 15 },
  keyBox: { borderRadius: 12, padding: 16 },
  keyText: { fontFamily: 'monospace', fontSize: 14, lineHeight: 21 },
  copyRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
  copyButton: { borderRadius: 999, height: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  copyButtonText: { fontWeight: '600', fontSize: 15 },
  timerText: { marginTop: 8, textAlign: 'center', fontFamily: 'monospace', fontSize: 12 },
});
