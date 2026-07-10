export const radius = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 18,
  full: 9999,
} as const;

export type Radius = typeof radius;
