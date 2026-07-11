import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Text, Pressable, Spinner, ProgressBar, VStack } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

type ImportState = 'idle' | 'importing' | 'done';

/**
 * S-05: Import Contacts — find contacts already on Kalam.
 */
export default function ImportContactsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [state, setState] = useState<ImportState>('idle');
  const [progress, setProgress] = useState(0);
  const [foundCount, setFoundCount] = useState(0);

  const handleImport = useCallback(() => {
    setState('importing');
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 0.15, 1);
        if (next >= 1) {
          clearInterval(interval);
          setState('done');
          setFoundCount(7); // Mock count
        }
        return next;
      });
    }, 200);
  }, []);

  const handleContinue = useCallback(() => {
    router.push('/auth/welcome');
  }, [router]);

  return (
    <OnboardingLayout showBack step={3} totalSteps={4}>
      <View style={[styles.content, { paddingHorizontal: theme.spacing[6] }]}>
        {/* Header */}
        <VStack spacing={3}>
          <Text variant="label" color="primary">
            {t('onboarding.importContacts.step')}
          </Text>
          <Text variant="h2">{t('onboarding.importContacts.title')}</Text>
          <Text variant="body" color="textSoft">
            {t('onboarding.importContacts.explanation')}
          </Text>
        </VStack>

        {/* Center content */}
        <View style={styles.centerSection}>
          {state === 'idle' && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 64 }}>📇</Text>
            </View>
          )}

          {state === 'importing' && (
            <VStack spacing={4} align="center" style={{ width: '100%' }}>
              <Spinner size="large" />
              <ProgressBar value={progress} />
              <Text variant="body" color="textSoft">
                {t('onboarding.importContacts.privacyNote')}
              </Text>
            </VStack>
          )}

          {state === 'done' && (
            <VStack spacing={3} align="center">
              <Text style={{ fontSize: 48 }}>🎉</Text>
              <Text variant="h3" align="center">
                {t('onboarding.importContacts.contactsFound', { count: foundCount })}
              </Text>
            </VStack>
          )}
        </View>

        {/* CTA */}
        <VStack spacing={3} style={{ marginBottom: theme.spacing[8] }}>
          {state === 'idle' && (
            <>
              <Pressable
                onPress={handleImport}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.full,
                  paddingVertical: theme.spacing[4],
                  alignItems: 'center',
                }}
                accessibilityLabel={t('onboarding.importContacts.cta')}
              >
                <Text color="textOnPrimary" weight="semibold">
                  {t('onboarding.importContacts.cta')}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleContinue}
                style={{ alignItems: 'center', paddingVertical: theme.spacing[2] }}
              >
                <Text variant="caption" color="textSoft" style={{ textDecorationLine: 'underline' }}>
                  {t('onboarding.importContacts.later')}
                </Text>
              </Pressable>
            </>
          )}

          {state === 'done' && (
            <Pressable
              onPress={handleContinue}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.full,
                paddingVertical: theme.spacing[4],
                alignItems: 'center',
              }}
              accessibilityLabel={t('common.continue')}
            >
              <Text color="textOnPrimary" weight="semibold">
                {t('common.continue')}
              </Text>
            </Pressable>
          )}
        </VStack>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 24,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});
