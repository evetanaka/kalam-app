export const fontFamily = {
  display: 'Bricolage Grotesque',
  body: 'Inter',
  mono: 'JetBrains Mono',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 40,
  display: 68,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.65,
} as const;

export const letterSpacing = {
  tight: -0.015,
  normal: 0,
  wide: 0.01,
  extraWide: 0.24,
} as const;

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
} as const;

export type Typography = typeof typography;
