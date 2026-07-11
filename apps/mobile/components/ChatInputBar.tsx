import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Pressable, Text, QuotedMessage } from '@kalam/ui';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  /** Quoted message to show above input */
  quotedMessage?: { senderName: string; text: string } | null;
  onCancelQuote?: () => void;
}

/**
 * Chat input bar with text input, attachment, payment, send/mic buttons.
 */
export function ChatInputBar({ onSend, quotedMessage, onCancelQuote }: ChatInputBarProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }, [text, onSend]);

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
      {/* Quoted message preview */}
      {quotedMessage && (
        <View style={[styles.quoteRow, { paddingHorizontal: theme.spacing[3] }]}>
          <View style={styles.quoteContent}>
            <QuotedMessage senderName={quotedMessage.senderName} text={quotedMessage.text} />
          </View>
          <Pressable onPress={onCancelQuote} style={styles.cancelQuote} minHitSlop={44}>
            <Text color="textSoft" style={{ fontSize: 18 }}>✕</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.bar, { paddingHorizontal: theme.spacing[2] }]}>
        {/* Attachment button */}
        <Pressable
          onPress={() => {}}
          style={styles.iconButton}
          accessibilityLabel={t('attachment.title')}
        >
          <Text style={{ fontSize: 20 }}>📎</Text>
        </Pressable>

        {/* Payment button (disabled for P7) */}
        <Pressable
          onPress={() => {}}
          disabled
          style={styles.iconButton}
          accessibilityLabel={t('payment.sendTo', { name: '' })}
        >
          <Text style={{ fontSize: 20 }}>💶</Text>
        </Pressable>

        {/* Text input */}
        <View style={[styles.inputContainer, {
          backgroundColor: theme.colors.backgroundAlt,
          borderRadius: theme.radius.xl,
        }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('chat.messagePlaceholder')}
            placeholderTextColor={theme.colors.textSoft}
            multiline
            maxLength={4000}
            style={[styles.input, {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamily.body,
              fontSize: theme.typography.fontSize.md,
              maxHeight: 100, // ~4 lines
            }]}
            accessibilityLabel={t('chat.messagePlaceholder')}
          />
        </View>

        {/* Send or Mic button */}
        {text.trim().length > 0 ? (
          <Pressable
            onPress={handleSend}
            style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
            accessibilityLabel={t('common.send')}
          >
            <Text color="textOnPrimary" weight="bold" style={{ fontSize: 18 }}>➤</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {}}
            style={styles.iconButton}
            accessibilityLabel="Voice message"
          >
            <Text style={{ fontSize: 20 }}>🎙</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  quoteContent: {
    flex: 1,
  },
  cancelQuote: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 6,
    gap: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  input: {
    minHeight: 24,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});
