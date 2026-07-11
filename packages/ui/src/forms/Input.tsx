import React, { useState } from 'react';
import { View, TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from '../primitives/Text';

export interface InputProps extends Omit<TextInputProps, 'onChange'> {
  /** Label above the input */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below */
  helper?: string;
  /** Left element */
  prefix?: React.ReactNode;
  /** Right element */
  suffix?: React.ReactNode;
  /** Password input */
  secure?: boolean;
  /** Value change handler */
  onChange?: (text: string) => void;
}

/** Text input with label, error state, and prefix/suffix support. */
export function Input({
  label, error, helper, prefix, suffix, secure, onChange,
  style, ...props
}: InputProps) {
  const { theme: t } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? t.colors.danger : focused ? t.colors.primary : t.colors.border;

  return (
    <View style={{ gap: t.spacing[1] }}>
      {label && <Text variant="label" color="textSoft">{label}</Text>}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor,
          borderRadius: t.radius.lg,
          backgroundColor: t.colors.background,
          paddingHorizontal: t.spacing[3],
          minHeight: 48,
        }}
      >
        {prefix}
        <TextInput
          {...props}
          secureTextEntry={secure}
          onChangeText={onChange}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          placeholderTextColor={t.colors.textSoft}
          style={[
            {
              flex: 1,
              color: t.colors.text,
              fontFamily: t.typography.fontFamily.body,
              fontSize: t.typography.fontSize.md,
              paddingVertical: t.spacing[2],
            },
            style,
          ]}
          accessibilityLabel={label}
        />
        {suffix}
      </View>
      {error && <Text variant="caption" color="danger">{error}</Text>}
      {!error && helper && <Text variant="caption" color="textSoft">{helper}</Text>}
    </View>
  );
}
