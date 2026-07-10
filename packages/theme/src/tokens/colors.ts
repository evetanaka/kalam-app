/** Light mode color tokens */
export const lightColors = {
  background: '#FFFFFF',
  backgroundAlt: '#F6FAF7',
  pale: '#E7F8EE',
  primary: '#1DAB61',
  primaryDeep: '#0B5C3B',
  header: '#0B5C3B',
  bubbleOut: '#D9FDD3',
  bubbleIn: '#FFFFFF',
  accent: '#F5C518',
  accentLight: '#FEF7DC',
  text: '#2E3D37',
  textSoft: '#61756C',
  textOnPrimary: '#FFFFFF',
  border: 'rgba(11,92,59,0.14)',
  danger: '#DC3545',
  checks: '#1DAB61',
  overlay: 'rgba(0,0,0,0.4)',
  card: '#FFFFFF',
} as const;

/** Dark mode color tokens */
export const darkColors: typeof lightColors = {
  background: '#0E2A1F',
  backgroundAlt: '#163527',
  pale: '#1A3D2B',
  primary: '#1DAB61',
  primaryDeep: '#0B5C3B',
  header: '#2F5D47',
  bubbleOut: '#1E4735',
  bubbleIn: '#22372C',
  accent: '#43C878',
  accentLight: '#1E4735',
  text: '#E8F0EA',
  textSoft: '#9DBBA9',
  textOnPrimary: '#FFFFFF',
  border: 'rgba(232,240,234,0.09)',
  danger: '#DC3545',
  checks: '#6FD08C',
  overlay: 'rgba(0,0,0,0.6)',
  card: '#163527',
} as const;

export type ColorTokens = typeof lightColors;
