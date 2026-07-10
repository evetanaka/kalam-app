import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import { lightTheme, darkTheme, type Theme } from './theme';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setDarkMode: (dark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

/** Theme provider with auto system dark mode detection and manual override */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<boolean | null>(null);

  const isDark = override ?? systemScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = useCallback(() => {
    setOverride((prev) => !(prev ?? isDark));
  }, [isDark]);

  const setDarkMode = useCallback((dark: boolean) => {
    setOverride(dark);
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setDarkMode }),
    [theme, toggleTheme, setDarkMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Returns the current theme and toggle controls */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Create theme-aware styles (similar to StyleSheet.create but receives theme).
 *
 * @example
 * const useStyles = useThemedStyles((t) => ({
 *   container: { backgroundColor: t.colors.background },
 * }));
 * // in component:
 * const styles = useStyles();
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  createStyles: (theme: Theme) => T,
): () => T {
  return () => {
    const { theme } = useTheme();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(() => StyleSheet.create(createStyles(theme)), [theme]);
  };
}
