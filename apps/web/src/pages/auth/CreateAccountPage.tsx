import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { useAuthStore } from '@kalam/stores';
import { Text, Spinner, VStack } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

export function CreateAccountPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreate = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    useAuthStore.getState().setPasskey({ credentialId: 'mock-' + Date.now() });
    setLoading(false);
    navigate('/auth/name');
  }, [navigate]);

  return (
    <OnboardingLayout showBack step={0} totalSteps={4}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 24,
        paddingBottom: 40,
        paddingLeft: theme.spacing[6],
        paddingRight: theme.spacing[6],
        maxWidth: 480,
        margin: '0 auto',
        width: '100%',
      }}>
        <VStack spacing={3}>
          <Text variant="label" color="primary">{t('onboarding.createAccount.step')}</Text>
          <Text variant="h2">{t('onboarding.createAccount.title')}</Text>
          <Text variant="body" color="textSoft">{t('onboarding.createAccount.explanation')}</Text>
        </VStack>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {loading ? (
            <VStack spacing={3} align="center">
              <Spinner size="large" />
              <Text variant="body" color="textSoft">{t('common.loading')}</Text>
            </VStack>
          ) : (
            <div style={{
              width: 140, height: 140,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: theme.colors.pale,
              borderRadius: theme.radius.xl,
            }}>
              <span style={{ fontSize: 64 }}>🔐</span>
            </div>
          )}
        </div>

        <VStack spacing={3}>
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.full,
              padding: `${theme.spacing[4]}px 0`,
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.6 : 1,
              textAlign: 'center',
            }}
          >
            <Text color="textOnPrimary" weight="semibold">{t('onboarding.createAccount.cta')}</Text>
          </button>

          <Text variant="caption" color="textSoft" align="center">{t('onboarding.createAccount.savedIn')}</Text>

          <button
            onClick={handleCreate}
            disabled={loading}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', padding: `${theme.spacing[2]}px 0` }}
          >
            <Text variant="caption" color="primary" style={{ textDecorationLine: 'underline' }}>
              {t('onboarding.createAccount.ctaFallback')}
            </Text>
          </button>
        </VStack>
      </div>
    </OnboardingLayout>
  );
}
