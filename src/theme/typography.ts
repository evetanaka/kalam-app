import { TextStyle } from 'react-native';

export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displayBold: 'BricolageGrotesque_800ExtraBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_400Regular',
} as const;

export const text: Record<string, TextStyle> = {
  h1: { fontFamily: fonts.displayBold, fontSize: 32, lineHeight: 36, letterSpacing: -1.2 },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.8 },
  h3: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24, letterSpacing: -0.4 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 26 },
  bodySmall: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22 },
  caption: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 18 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 13, lineHeight: 18, letterSpacing: 0.3 },
};
