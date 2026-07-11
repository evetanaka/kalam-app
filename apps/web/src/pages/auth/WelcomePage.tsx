import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { useAuthStore, useWalletStore } from '@kalam/stores';
import { Text, SecurityBadge, Box, VStack } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

const CONFETTI_COUNT = 20;

export function WelcomePage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account);
  const isDiscovery = useWalletStore((s) => s.isDiscoveryMode);

  const confetti = useMemo(() =>
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#1DAB61', '#F5C518', '#DC3545', '#1DAB61', '#F5C518'][Math.floor(Math.random() * 5)],
      size: 6 + Math.random() * 6,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 1.5,
    })),
  []);

  const handleStart = () => {
    useAuthStore.getState().setOnboarded();
    navigate('/');
  };

  const displayName = account?.name || 'kalam';

  return (
    <OnboardingLayout bg="background">
      {/* CSS confetti */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px); opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0.5; }
        }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {confetti.map((c) => (
          <div key={c.id} style={{
            position: 'absolute',
            left: `${c.x}%`,
            top: -20,
            width: c.size,
            height: c.size,
            borderRadius: c.size / 2,
            backgroundColor: c.color,
            animation: `confettiFall ${c.duration}s ${c.delay}s linear infinite`,
          }} />
        ))}
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        paddingTop: 80, paddingLeft: theme.spacing[6], paddingRight: theme.spacing[6],
        maxWidth: 480, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1,
      }}>
        <VStack spacing={3} align="center" style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 48 }}>🎉</span>
          <Text variant="h2" align="center">
            {t('onboarding.welcome.title', { name: displayName })}
          </Text>
          <Text variant="body" color="textSoft" align="center">
            {isDiscovery ? t('onboarding.welcome.discoveryMode') : t('onboarding.welcome.subtitleReady')}
          </Text>
        </VStack>

        <Box bg="accentLight" radius="xl" p={5} border style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing[2] }}>
          <SecurityBadge />
          <Text variant="h3" align="center" style={{ marginTop: theme.spacing[2] }}>
            {isDiscovery
              ? t('onboarding.welcome.discoveryMode')
              : t('onboarding.welcome.yearsOfMessages', {
                  years: Math.round((useWalletStore.getState().balanceCents / 100 / 0.0001 / (365 * 50)) * 10) / 10 || '∞',
                })}
          </Text>
          <Text variant="caption" color="textSoft" align="center">{t('onboarding.welcome.subtitleReady')}</Text>
        </Box>

        <div style={{ flex: 1 }} />

        <button onClick={handleStart} style={{
          backgroundColor: theme.colors.primary, borderRadius: theme.radius.full,
          padding: `${theme.spacing[4]}px 0`, border: 'none', cursor: 'pointer',
          marginBottom: theme.spacing[8], textAlign: 'center',
        }}>
          <Text color="textOnPrimary" weight="semibold">{t('onboarding.welcome.startChatting')}</Text>
        </button>
      </div>
    </OnboardingLayout>
  );
}
