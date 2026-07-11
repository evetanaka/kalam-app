import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';

type TextVariant = 'body' | 'caption' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'mono' | 'display';

export interface TextProps extends RNTextProps {
  /** Text variant controlling size, weight and font */
  variant?: TextVariant;
  /** Semantic color token key */
  color?: keyof Theme['colors'];
  /** Override font weight */
  weight?: keyof Theme['typography']['fontWeight'];
  /** Override font size token */
  size?: keyof Theme['typography']['fontSize'];
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

const variantStyles = (t: Theme): Record<TextVariant, any> => ({
  body: { fontFamily: t.typography.fontFamily.body, fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.regular, lineHeight: t.typography.fontSize.md * t.typography.lineHeight.normal },
  caption: { fontFamily: t.typography.fontFamily.body, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.regular, color: t.colors.textSoft },
  label: { fontFamily: t.typography.fontFamily.body, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, letterSpacing: t.typography.letterSpacing.wide },
  h1: { fontFamily: t.typography.fontFamily.display, fontSize: t.typography.fontSize['4xl'], fontWeight: t.typography.fontWeight.extrabold, lineHeight: t.typography.fontSize['4xl'] * t.typography.lineHeight.tight },
  h2: { fontFamily: t.typography.fontFamily.display, fontSize: t.typography.fontSize['3xl'], fontWeight: t.typography.fontWeight.bold, lineHeight: t.typography.fontSize['3xl'] * t.typography.lineHeight.tight },
  h3: { fontFamily: t.typography.fontFamily.display, fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.semibold },
  h4: { fontFamily: t.typography.fontFamily.display, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.semibold },
  mono: { fontFamily: t.typography.fontFamily.mono, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.regular, letterSpacing: t.typography.letterSpacing.extraWide },
  display: { fontFamily: t.typography.fontFamily.display, fontSize: t.typography.fontSize.display, fontWeight: t.typography.fontWeight.extrabold, lineHeight: t.typography.fontSize.display * t.typography.lineHeight.tight, letterSpacing: t.typography.letterSpacing.tight },
});

/**
 * Themed Text component with variant support.
 * Uses semantic color tokens from @kalam/theme.
 */
export function Text({ variant = 'body', color, weight, size, align, style, ...props }: TextProps) {
  const { theme } = useTheme();
  const vs = variantStyles(theme)[variant];

  const resolvedStyle = [
    { color: theme.colors.text },
    vs,
    color && { color: theme.colors[color] },
    weight && { fontWeight: theme.typography.fontWeight[weight] },
    size && { fontSize: theme.typography.fontSize[size] },
    align && { textAlign: align },
    style,
  ];

  return <RNText {...props} style={resolvedStyle} />;
}
