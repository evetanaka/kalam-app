import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, Pressable, TextInput } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onReport: (motif: string, comment: string) => void;
  username?: string;
}

const motifs = ['Spam', 'Contenu non sollicité', 'Harcèlement', 'Autre'];

export function ReportSheet({ visible, onClose, onReport, username = 'sophie.kalam' }: Props) {
  const { theme: t } = useTheme();
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: t.colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: t.colors.card }]} onPress={() => {}}>
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: t.colors.border }]} />
          </View>

          <View style={styles.content}>
            {/* Title */}
            <Text style={[styles.title, { color: t.colors.text }]}>
              Signaler {username}
            </Text>

            {/* Explanation */}
            <Text style={[styles.explanation, { color: t.colors.text }]}>
              Ce signalement est vérifié cryptographiquement. Si confirmé, le dépôt de l'expéditeur sera entaillé. Un signalement abusif vous coûte votre caution de 0,50 €.
            </Text>

            {/* Radio list */}
            <View style={styles.radioList}>
              {motifs.map((m, i) => (
                <Pressable
                  key={i}
                  style={[
                    styles.radioRow,
                    i < motifs.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.colors.border },
                  ]}
                  onPress={() => setSelected(i)}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: i === selected ? t.colors.green : t.colors.border },
                    ]}
                  >
                    {i === selected && (
                      <View style={[styles.radioInner, { backgroundColor: t.colors.green }]} />
                    )}
                  </View>
                  <Text style={[styles.radioLabel, { color: t.colors.text }]}>{m}</Text>
                </Pressable>
              ))}
            </View>

            {/* Comment textarea */}
            <TextInput
              style={[
                styles.textarea,
                {
                  color: t.colors.text,
                  borderColor: t.colors.border,
                  backgroundColor: t.colors.background,
                },
              ]}
              placeholder="Détails (optionnel)"
              placeholderTextColor={t.colors.textSoft}
              multiline
              value={comment}
              onChangeText={setComment}
            />

            {/* Caution mention */}
            <View style={styles.cautionRow}>
              <Ionicons name="alert" size={16} color={t.colors.warning} />
              <Text style={[styles.cautionText, { color: t.colors.warning }]}>
                Caution de 0,50 € requise — rendue si le signalement est confirmé.
              </Text>
            </View>

            {/* Buttons */}
            <Pressable
              style={[styles.reportButton, { backgroundColor: t.colors.danger }]}
              onPress={() => onReport(motifs[selected], comment)}
            >
              <Text style={[styles.reportButtonText, { color: '#FFFFFF' }]}>Signaler</Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={[styles.cancelText, { color: t.colors.textSoft }]}>Annuler</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '55%',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontWeight: '700',
    fontSize: 17,
  },
  explanation: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  radioList: {
    marginTop: 16,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
  },
  textarea: {
    width: '100%',
    height: 80,
    marginTop: 16,
    fontSize: 14,
    lineHeight: 21,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    textAlignVertical: 'top',
  },
  cautionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  cautionText: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  reportButton: {
    width: '100%',
    height: 52,
    marginTop: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
  cancelButton: {
    width: '100%',
    height: 44,
    marginTop: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
