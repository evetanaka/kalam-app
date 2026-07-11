import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { Pressable, Text } from '@kalam/ui';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  /** Current step (0-based) for dot indicator */
  step?: number;
  /** Total steps */
  totalSteps?: number;
  /** Show back button */
  showBack?: boolean;
  /** Background color token */
  bg?: 'background' | 'primaryDeep';
}

/**
 * Shared layout wrapper for onboarding screens.
 * Provides: fade-in animation, optional back button, step dots, consistent padding.
 */
export function OnboardingLayout({
  children,
  step,
  totalSteps = 6,
  showBack = false,
  bg = 'background',
}: OnboardingLayoutProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.slow,
      useNativeDriver: true,
    }).start();
  }, []);

  const isDark = bg === 'primaryDeep';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors[bg] }]}>
      {/* Header with back button */}
      {showBack && (
        <View style={[styles.header, { paddingHorizontal: theme.spacing[4] }]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Retour"
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                color: isDark ? theme.colors.textOnPrimary : theme.colors.text,
              }}
            >
              ←
            </Text>
          </Pressable>
        </View>
      )}

      {/* Content with fade-in */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {children}
      </Animated.View>

      {/* Step indicator dots */}
      {step != null && (
        <View style={[styles.dots, { paddingBottom: theme.spacing[8] }]}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === step
                      ? isDark
                        ? theme.colors.textOnPrimary
                        : theme.colors.primary
                      : isDark
                        ? 'rgba(255,255,255,0.3)'
                        : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 8,
  },
  backButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
