import { Platform } from 'react-native';

type Shadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

const createShadow = (
  color: string,
  offsetY: number,
  opacity: number,
  blur: number,
  elevation: number,
): Shadow => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: Platform.OS === 'web' ? opacity : opacity,
  shadowRadius: blur,
  elevation,
});

export const shadows = {
  none: createShadow('transparent', 0, 0, 0, 0),
  sm: createShadow('#000', 1, 0.05, 2, 1),
  md: createShadow('#000', 2, 0.08, 8, 3),
  lg: createShadow('#000', 4, 0.12, 16, 6),
  xl: createShadow('#000', 8, 0.16, 24, 10),
} as const;

export type Shadows = typeof shadows;
