import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { useAuthStore } from '@kalam/stores';
import { Text, Pressable, Spinner, VStack } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

/**
 * S-02: Create Account — passkey creation with Face ID / biometric.
 */
export default function CreateAccountScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = useCallback(async () => {
    setLoading(true);
    // Simulate passkey creation delay
    await new Promise((r) => setTimeout(r, 1500));
    useAuthStore.getState().setPasskey({ credentialId: 'mock-' + Date.now() });
    setLoading(false);
    router.push('/auth/choose-name');
  }, [router]);

  return (
    <OnboardingLayout showBack step={0} totalSteps={4}>
      <View style={[styles.content, { paddingHorizontal: theme.spacing[6] }]}>
        {/* Header */}
        <VStack spacing={3} style={styles.header}>
          <Text variant="label" color="primary">
            {t('onboarding.createAccount.step')}
          </Text>
          <Text variant="h2">{t('onboarding.createAccount.title')}</Text>
          <Text variant="body" color="textSoft">
            {t('onboarding.createAccount.explanation')}
          </Text>
        </VStack>

        {/* Biometric icon */}
        <View style={styles.iconSection}>
          {loading ? (
            <VStack spacing={3} align="center">
              <Spinner size="large" />
              <Text variant="body" color="textSoft">
                {t('common.loading')}
              </Text>
            </VStack>
          ) : (
            <View
              style={[
                styles.biometricIcon,
                {
                  backgroundColor: theme.colors.pale,
                  borderRadius: theme.radius.xl,
                },
              ]}
            >
              <Text style={{ fontSize: 64 }}>🔐</Text>
            </View>
          )}
        </View>

        {/* CTA */}
        <VStack spacing={3} style={styles.footer}>
          <Pressable
            onPress={handleCreate}
            disabled={loading}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.full,
              paddingVertical: theme.spacing[4],
              alignItems: 'center',
            }}
            accessibilityLabel={t('onboarding.createAccount.cta')}
          >
            <Text color="textOnPrimary" weight="semibold">
              {t('onboarding.createAccount.cta')}
            </Text>
          </Pressable>

          <Text variant="caption" color="textSoft" align="center">
            {t('onboarding.createAccount.savedIn')}
          </Text>

          <Pressable
            onPress={handleCreate}
            disabled={loading}
            style={{ alignItems: 'center', paddingVertical: theme.spacing[2] }}
          >
            <Text variant="caption" color="primary" style={{ textDecorationLine: 'underline' }}>
              {t('onboarding.createAccount.ctaFallback')}
            </Text>
          </Pressable>
        </VStack>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {},
  iconSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricIcon: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {},
});
