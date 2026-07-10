import { lightColors, darkColors, type ColorTokens } from './tokens/colors';
import { typography, type Typography } from './tokens/typography';
import { spacing, type Spacing } from './tokens/spacing';
import { radius, type Radius } from './tokens/radius';
import { shadows, type Shadows } from './tokens/shadows';
import { animations, type Animations } from './tokens/animations';

export type Theme = {
  dark: boolean;
  colors: ColorTokens;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadows: Shadows;
  animations: Animations;
};

export const lightTheme: Theme = {
  dark: false,
  colors: lightColors,
  typography,
  spacing,
  radius,
  shadows,
  animations,
};

export const darkTheme: Theme = {
  dark: true,
  colors: darkColors,
  typography,
  spacing,
  radius,
  shadows,
  animations,
};
