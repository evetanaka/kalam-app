import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  onMore: () => void;
}

const emojis = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

export function ReactionsBar({ visible, onClose, onSelect, onMore }: Props) {
  const { theme: t } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: t.colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: t.colors.card }]} onPress={() => {}}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: t.colors.border }]} />

          <View style={styles.row}>
            {emojis.map((e, i) => (
              <Pressable key={i} style={styles.emojiButton} onPress={() => onSelect(e)}>
                <Text style={styles.emoji}>{e}</Text>
              </Pressable>
            ))}
            <Pressable style={[styles.plusButton, { backgroundColor: t.colors.background }]} onPress={onMore}>
              <Ionicons name="add" size={18} color={t.colors.textSoft} />
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
    padding: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emojiButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
