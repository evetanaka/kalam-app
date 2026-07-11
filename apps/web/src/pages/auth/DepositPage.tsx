import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { useWalletStore } from '@kalam/stores';
import { Text, AmountInput, Badge, VStack, Box } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

const PRESETS = [4.9, 10, 25];
const COST_PER_MSG = 0.0001;
const MSGS_PER_YEAR = 365 * 50;

export function DepositPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('4.9');

  const yearsEstimate = useMemo(() => {
    const val = parseFloat(amount) || 0;
    return Math.round((val / COST_PER_MSG / MSGS_PER_YEAR) * 10) / 10;
  }, [amount]);

  const handleDeposit = useCallback(() => {
    const amountCents = Math.round((parseFloat(amount) || 0) * 100);
    useWalletStore.getState().addDeposit({
      id: 'dep-' + Date.now(), amountCents, amountKlm: amountCents * 100,
      method: 'apple_pay', status: 'confirmed', createdAt: Date.now(), txHash: '0x' + 'b'.repeat(64),
    });
    useWalletStore.getState().setBalance(amountCents, amountCents * 100);
    navigate('/auth/contacts');
  }, [amount, navigate]);

  const handleSkip = useCallback(() => {
    useWalletStore.getState().enterDiscoveryMode();
    navigate('/auth/contacts');
  }, [navigate]);

  return (
    <OnboardingLayout showBack step={2} totalSteps={4}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 24,
        paddingLeft: theme.spacing[6], paddingRight: theme.spacing[6],
        maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        <VStack spacing={3}>
          <Text variant="label" color="primary">{t('onboarding.deposit.step')}</Text>
          <Text variant="h2">{t('onboarding.deposit.title')}</Text>
          <Text variant="body" color="textSoft">{t('onboarding.deposit.explanation')}</Text>
        </VStack>

        <div style={{ marginTop: theme.spacing[8] }}>
          <AmountInput value={amount} onChange={setAmount} presets={PRESETS} currency="€" />
          {amount === '4.9' && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: theme.spacing[2] }}>
              <Badge variant="accent" label="Recommandé" />
            </div>
          )}
          <Text variant="caption" color="textSoft" align="center" style={{ marginTop: theme.spacing[3] }}>
            {t('onboarding.deposit.equivalence', {
              amount, klm: Math.round((parseFloat(amount) || 0) * 100), years: yearsEstimate,
            })}
          </Text>
        </div>

        <Box bg="pale" radius="lg" p={3} row style={{ marginTop: theme.spacing[6], alignItems: 'center', gap: theme.spacing[2] }}>
          <Text style={{ fontSize: 20 }}>🔒</Text>
          <Text variant="caption" color="text" style={{ flex: 1 }}>{t('onboarding.deposit.recoverable')}</Text>
        </Box>

        <div style={{ flex: 1 }} />

        <VStack spacing={3} style={{ marginBottom: theme.spacing[8] }}>
          <button onClick={handleDeposit} style={{
            backgroundColor: theme.colors.primary, borderRadius: theme.radius.full,
            padding: `${theme.spacing[4]}px 0`, border: 'none', cursor: 'pointer', textAlign: 'center',
          }}>
            <Text color="textOnPrimary" weight="semibold">{t('onboarding.deposit.applePay')}</Text>
          </button>
          <button onClick={handleSkip} style={{
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', padding: `${theme.spacing[2]}px 0`,
          }}>
            <Text variant="caption" color="textSoft" style={{ textDecorationLine: 'underline' }}>{t('onboarding.deposit.skipForNow')}</Text>
          </button>
        </VStack>
      </div>
    </OnboardingLayout>
  );
}
