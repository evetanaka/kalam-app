import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { QuotedMessage } from '@kalam/ui';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  quotedMessage?: { senderName: string; text: string } | null;
  onCancelQuote?: () => void;
}

export function ChatInputBar({ onSend, quotedMessage, onCancelQuote }: ChatInputBarProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  }, [text, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div style={{
      borderTop: `0.5px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.background,
    }}>
      {quotedMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: `8px ${theme.spacing[3]}px 0`,
        }}>
          <div style={{ flex: 1 }}>
            <QuotedMessage senderName={quotedMessage.senderName} text={quotedMessage.text} />
          </div>
          <button
            onClick={onCancelQuote}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: theme.colors.textSoft,
              minHeight: 44,
              minWidth: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        padding: `6px ${theme.spacing[2]}px`,
        gap: 4,
      }}>
        <button
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}
          aria-label={t('attachment.title')}
        >📎</button>

        <button
          disabled
          style={{
            background: 'none', border: 'none',
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, opacity: 0.4, cursor: 'default',
          }}
        >💶</button>

        <div style={{
          flex: 1,
          backgroundColor: theme.colors.backgroundAlt,
          borderRadius: theme.radius.xl,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 6,
          paddingBottom: 6,
        }}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.messagePlaceholder')}
            maxLength={4000}
            rows={1}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: 'transparent',
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamily.body,
              fontSize: theme.typography.fontSize.md,
              maxHeight: 100,
              minHeight: 24,
              lineHeight: '24px',
            }}
            aria-label={t('chat.messagePlaceholder')}
          />
        </div>

        {text.trim().length > 0 ? (
          <button
            onClick={handleSend}
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: theme.colors.primary,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: 18,
            }}
            aria-label={t('common.send')}
          >➤</button>
        ) : (
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}
            aria-label="Voice message"
          >🎙</button>
        )}
      </div>
    </div>
  );
}
