import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Text, Spinner, ProgressBar, VStack } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

type ImportState = 'idle' | 'importing' | 'done';

export function ImportContactsPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<ImportState>('idle');
  const [progress, setProgress] = useState(0);
  const [foundCount, setFoundCount] = useState(0);

  const handleImport = useCallback(() => {
    setState('importing');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 0.15, 1);
        if (next >= 1) { clearInterval(interval); setState('done'); setFoundCount(7); }
        return next;
      });
    }, 200);
  }, []);

  const handleContinue = useCallback(() => navigate('/auth/welcome'), [navigate]);

  return (
    <OnboardingLayout showBack step={3} totalSteps={4}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 24,
        paddingLeft: theme.spacing[6], paddingRight: theme.spacing[6],
        maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        <VStack spacing={3}>
          <Text variant="label" color="primary">{t('onboarding.importContacts.step')}</Text>
          <Text variant="h2">{t('onboarding.importContacts.title')}</Text>
          <Text variant="body" color="textSoft">{t('onboarding.importContacts.explanation')}</Text>
        </VStack>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          {state === 'idle' && <span style={{ fontSize: 64 }}>📇</span>}
          {state === 'importing' && (
            <VStack spacing={4} align="center" style={{ width: '100%' }}>
              <Spinner size="large" />
              <ProgressBar value={progress} />
              <Text variant="body" color="textSoft">{t('onboarding.importContacts.privacyNote')}</Text>
            </VStack>
          )}
          {state === 'done' && (
            <VStack spacing={3} align="center">
              <span style={{ fontSize: 48 }}>🎉</span>
              <Text variant="h3" align="center">{t('onboarding.importContacts.contactsFound', { count: foundCount })}</Text>
            </VStack>
          )}
        </div>

        <VStack spacing={3} style={{ marginBottom: theme.spacing[8] }}>
          {state === 'idle' && (
            <>
              <button onClick={handleImport} style={{
                backgroundColor: theme.colors.primary, borderRadius: theme.radius.full,
                padding: `${theme.spacing[4]}px 0`, border: 'none', cursor: 'pointer', textAlign: 'center',
              }}>
                <Text color="textOnPrimary" weight="semibold">{t('onboarding.importContacts.cta')}</Text>
              </button>
              <button onClick={handleContinue} style={{
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', padding: `${theme.spacing[2]}px 0`,
              }}>
                <Text variant="caption" color="textSoft" style={{ textDecorationLine: 'underline' }}>{t('onboarding.importContacts.later')}</Text>
              </button>
            </>
          )}
          {state === 'done' && (
            <button onClick={handleContinue} style={{
              backgroundColor: theme.colors.primary, borderRadius: theme.radius.full,
              padding: `${theme.spacing[4]}px 0`, border: 'none', cursor: 'pointer', textAlign: 'center',
            }}>
              <Text color="textOnPrimary" weight="semibold">{t('common.continue')}</Text>
            </button>
          )}
        </VStack>
      </div>
    </OnboardingLayout>
  );
}
