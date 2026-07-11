import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { useWalletStore } from '@kalam/stores';
import { Text, Pressable, AmountInput, Badge, VStack, HStack, Box } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

const PRESETS = [4.9, 10, 25];
const COST_PER_MSG = 0.0001; // € per message
const MSGS_PER_YEAR = 365 * 50; // ~50 msgs/day

/**
 * S-04: Deposit — guarantee deposit with amount selection.
 */
export default function DepositScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [amount, setAmount] = useState('4.9');

  const yearsEstimate = useMemo(() => {
    const val = parseFloat(amount) || 0;
    const totalMsgs = val / COST_PER_MSG;
    return Math.round((totalMsgs / MSGS_PER_YEAR) * 10) / 10;
  }, [amount]);

  const handleDeposit = useCallback(() => {
    const amountCents = Math.round((parseFloat(amount) || 0) * 100);
    useWalletStore.getState().addDeposit({
      id: 'dep-' + Date.now(),
      amountCents,
      amountKlm: amountCents * 100, // mock rate
      method: 'apple_pay',
      status: 'confirmed',
      createdAt: Date.now(),
      txHash: '0x' + 'b'.repeat(64),
    });
    useWalletStore.getState().setBalance(amountCents, amountCents * 100);
    router.push('/auth/import-contacts');
  }, [amount, router]);

  const handleSkip = useCallback(() => {
    useWalletStore.getState().enterDiscoveryMode();
    router.push('/auth/import-contacts');
  }, [router]);

  return (
    <OnboardingLayout showBack step={2} totalSteps={4}>
      <View style={[styles.content, { paddingHorizontal: theme.spacing[6] }]}>
        {/* Header */}
        <VStack spacing={3}>
          <Text variant="label" color="primary">
            {t('onboarding.deposit.step')}
          </Text>
          <Text variant="h2">{t('onboarding.deposit.title')}</Text>
          <Text variant="body" color="textSoft">
            {t('onboarding.deposit.explanation')}
          </Text>
        </VStack>

        {/* Amount input with presets */}
        <View style={{ marginTop: theme.spacing[8] }}>
          <AmountInput
            value={amount}
            onChange={setAmount}
            presets={PRESETS}
            currency="€"
          />

          {/* Recommended badge on first preset */}
          {amount === '4.9' && (
            <View style={{ alignItems: 'center', marginTop: theme.spacing[2] }}>
              <Badge variant="accent" label="Recommandé" />
            </View>
          )}

          {/* Years estimate */}
          <Text
            variant="caption"
            color="textSoft"
            align="center"
            style={{ marginTop: theme.spacing[3] }}
          >
            {t('onboarding.deposit.equivalence', {
              amount: amount,
              klm: Math.round((parseFloat(amount) || 0) * 100),
              years: yearsEstimate,
            })}
          </Text>
        </View>

        {/* Recoverable notice */}
        <Box
          bg="pale"
          radius="lg"
          p={3}
          row
          style={{ marginTop: theme.spacing[6], alignItems: 'center', gap: theme.spacing[2] }}
        >
          <Text style={{ fontSize: 20 }}>🔒</Text>
          <Text variant="caption" color="text" style={{ flex: 1 }}>
            {t('onboarding.deposit.recoverable')}
          </Text>
        </Box>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* CTA */}
        <VStack spacing={3} style={{ marginBottom: theme.spacing[8] }}>
          <Pressable
            onPress={handleDeposit}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.full,
              paddingVertical: theme.spacing[4],
              alignItems: 'center',
            }}
            accessibilityLabel={t('onboarding.deposit.applePay')}
          >
            <Text color="textOnPrimary" weight="semibold">
              {t('onboarding.deposit.applePay')}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSkip}
            style={{ alignItems: 'center', paddingVertical: theme.spacing[2] }}
          >
            <Text variant="caption" color="textSoft" style={{ textDecorationLine: 'underline' }}>
              {t('onboarding.deposit.skipForNow')}
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
    paddingTop: 24,
  },
});
