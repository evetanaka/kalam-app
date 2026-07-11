import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}

const options: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; bg: string }[] = [
  { icon: 'camera', label: 'Photo', color: '#1565C0', bg: '#E3F2FD' },
  { icon: 'image', label: 'Galerie', color: '#2E7D32', bg: '#E8F5E9' },
  { icon: 'videocam', label: 'Vidéo', color: '#E65100', bg: '#FFF3E0' },
  { icon: 'document', label: 'Document', color: '#7B1FA2', bg: '#F3E5F5' },
  { icon: 'mic', label: 'Vocal', color: '#C62828', bg: '#FFEBEE' },
  { icon: 'location', label: 'Position', color: '#00838F', bg: '#E0F7FA' },
];

export function MediaSheet({ visible, onClose, onSelect }: Props) {
  const { theme: t } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: t.colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: t.colors.card }]} onPress={() => {}}>
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: t.colors.border }]} />
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {options.map((o, i) => (
              <Pressable key={i} style={styles.gridItem} onPress={() => onSelect(o.label)}>
                <View style={[styles.iconCircle, { backgroundColor: o.bg }]}>
                  <Ionicons name={o.icon} size={24} color={o.color} />
                </View>
                <Text style={[styles.label, { color: t.colors.text }]}>{o.label}</Text>
              </Pressable>
            ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '33%',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 17,
  },
});
