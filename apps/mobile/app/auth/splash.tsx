import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Logo, Text, Pressable } from '@kalam/ui';

/**
 * S-01: Splash screen — first screen the user sees.
 * Deep green background, logo, tagline, CTA to create or restore.
 */
export default function SplashScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.slow,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primaryDeep }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo + Tagline */}
        <View style={styles.brandSection}>
          <Logo size="lg" />
          <Text
            variant="h2"
            align="center"
            style={{ color: theme.colors.textOnPrimary, marginTop: theme.spacing[4] }}
          >
            {t('onboarding.splash.title')}
          </Text>
          <Text
            variant="body"
            align="center"
            style={{ color: theme.colors.textOnPrimary, opacity: 0.85, marginTop: theme.spacing[2] }}
          >
            {t('onboarding.splash.subtitle')}
          </Text>
        </View>

        {/* CTA buttons */}
        <View style={[styles.ctaSection, { paddingHorizontal: theme.spacing[6], gap: theme.spacing[4] }]}>
          {/* Primary CTA */}
          <Pressable
            onPress={() => router.push('/auth/create-account')}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.full,
              paddingVertical: theme.spacing[4],
              alignItems: 'center',
            }}
            accessibilityLabel={t('onboarding.splash.createAccount')}
          >
            <Text color="textOnPrimary" weight="semibold" size="md">
              {t('onboarding.splash.createAccount')}
            </Text>
          </Pressable>

          {/* Secondary: restore */}
          <Pressable
            onPress={() => router.push('/auth/restore-account')}
            style={{ alignItems: 'center', paddingVertical: theme.spacing[2] }}
            accessibilityLabel={t('onboarding.splash.existingAccount')}
          >
            <Text
              style={{
                color: theme.colors.textOnPrimary,
                opacity: 0.8,
                textDecorationLine: 'underline',
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              {t('onboarding.splash.existingAccount')}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  brandSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaSection: {
    paddingBottom: 60,
  },
});
