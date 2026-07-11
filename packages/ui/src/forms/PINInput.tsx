import React, { useRef } from 'react';
import { View, TextInput } from 'react-native';
import { useTheme } from '@kalam/theme';

export interface PINInputProps {
  /** Number of digits */
  length?: number;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (pin: string) => void;
  /** Hide digits */
  secure?: boolean;
}

/** PIN code input with individual digit squares. */
export function PINInput({ length = 6, value, onChange, secure }: PINInputProps) {
  const { theme: t } = useTheme();
  const inputRef = useRef<TextInput>(null);

  return (
    <View>
      <View
        style={{ flexDirection: 'row', gap: t.spacing[2], justifyContent: 'center' }}
        accessibilityRole="none"
        accessibilityLabel="PIN input"
      >
        {Array.from({ length }).map((_, i) => {
          const char = value[i];
          const isCurrent = i === value.length;
          return (
            <View
              key={i}
              style={{
                width: 48,
                height: 56,
                borderRadius: t.radius.lg,
                borderWidth: 2,
                borderColor: isCurrent ? t.colors.primary : char ? t.colors.primaryDeep : t.colors.border,
                backgroundColor: t.colors.backgroundAlt,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {char ? (
                  <View
                    style={{
                      width: secure ? 12 : undefined,
                      height: secure ? 12 : undefined,
                      borderRadius: secure ? 6 : 0,
                      backgroundColor: secure ? t.colors.text : 'transparent',
                    }}
                  >
                    {!secure && (
                      <TextInput
                        editable={false}
                        value={char}
                        style={{
                          color: t.colors.text,
                          fontSize: t.typography.fontSize['2xl'],
                          fontFamily: t.typography.fontFamily.mono,
                          fontWeight: t.typography.fontWeight.bold,
                          textAlign: 'center',
                        }}
                      />
                    )}
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
      {/* Hidden input captures keyboard */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
        accessibilityLabel="PIN code entry"
      />
    </View>
  );
}
