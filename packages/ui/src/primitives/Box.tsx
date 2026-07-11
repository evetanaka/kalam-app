import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { useTheme, type Theme } from '@kalam/theme';

export interface BoxProps extends ViewProps {
  /** Padding (spacing token key) */
  p?: keyof Theme['spacing'];
  px?: keyof Theme['spacing'];
  py?: keyof Theme['spacing'];
  /** Margin (spacing token key) */
  m?: keyof Theme['spacing'];
  mx?: keyof Theme['spacing'];
  my?: keyof Theme['spacing'];
  /** Background color token */
  bg?: keyof Theme['colors'];
  /** Border radius token */
  radius?: keyof Theme['radius'];
  /** Show border */
  border?: boolean;
  /** Shadow token */
  shadow?: keyof Theme['shadows'];
  /** Flex value */
  flex?: number;
  /** Row direction */
  row?: boolean;
  /** Center content */
  center?: boolean;
}

/**
 * Themed View wrapper with token-based spacing, colors, and layout props.
 */
export function Box({
  p, px, py, m, mx, my,
  bg, radius, border, shadow,
  flex, row, center,
  style, ...props
}: BoxProps) {
  const { theme: t } = useTheme();

  const resolvedStyle = [
    p != null && { padding: t.spacing[p] },
    px != null && { paddingHorizontal: t.spacing[px] },
    py != null && { paddingVertical: t.spacing[py] },
    m != null && { margin: t.spacing[m] },
    mx != null && { marginHorizontal: t.spacing[mx] },
    my != null && { marginVertical: t.spacing[my] },
    bg && { backgroundColor: t.colors[bg] },
    radius && { borderRadius: t.radius[radius] },
    border && { borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border },
    shadow && t.shadows[shadow],
    flex != null && { flex },
    row && { flexDirection: 'row' as const },
    center && { alignItems: 'center' as const, justifyContent: 'center' as const },
    style,
  ];

  return <View {...props} style={resolvedStyle} />;
}
