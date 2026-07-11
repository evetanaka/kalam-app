import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Text, Pressable, VStack, HStack, Box, Badge, ProgressBar } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Guardian {
  name: string;
  status: 'pending' | 'approved' | 'refused';
}

const INITIAL_GUARDIANS: Guardian[] = [
  { name: 'alice.kalam', status: 'pending' },
  { name: 'bob.kalam', status: 'pending' },
  { name: 'charlie.kalam', status: 'pending' },
];

/**
 * S-08: Social Recovery — request guardian approvals.
 */
export default function SocialRecoveryScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [guardians, setGuardians] = useState<Guardian[]>(INITIAL_GUARDIANS);
  const [notified, setNotified] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const approvedCount = guardians.filter((g) => g.status === 'approved').length;
  const isComplete = approvedCount >= 2;

  // Auto-simulate approvals after notification
  useEffect(() => {
    if (!notified) return;

    let approvalIndex = 0;
    intervalRef.current = setInterval(() => {
      setGuardians((prev) => {
        const next = [...prev];
        const pendingIdx = next.findIndex((g) => g.status === 'pending');
        if (pendingIdx === -1) {
          clearInterval(intervalRef.current!);
          return prev;
        }
        next[pendingIdx] = { ...next[pendingIdx], status: 'approved' };
        approvalIndex++;
        if (approvalIndex >= 2) clearInterval(intervalRef.current!);
        return next;
      });
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [notified]);

  const handleNotify = useCallback(() => {
    setNotified(true);
  }, []);

  const handleRecover = useCallback(() => {
    router.push('/auth/deposit');
  }, [router]);

  return (
    <OnboardingLayout showBack>
      <View style={[styles.content, { paddingHorizontal: theme.spacing[6] }]}>
        {/* Header */}
        <VStack spacing={3}>
          <Text variant="h2">{t('recovery.headline')}</Text>
          <Text variant="body" color="textSoft">
            {t('recovery.explanation')}
          </Text>
        </VStack>

        {/* Guardian cards */}
        <VStack spacing={3} style={{ marginTop: theme.spacing[6] }}>
          {guardians.map((g, i) => (
            <Box
              key={i}
              bg="backgroundAlt"
              radius="lg"
              p={4}
              row
              style={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Text variant="body" weight="semibold">{g.name}</Text>
              <Badge
                variant={g.status === 'approved' ? 'primary' : g.status === 'refused' ? 'danger' : 'subtle'}
                label={
                  g.status === 'approved'
                    ? t('recovery.statusApproved')
                    : g.status === 'refused'
                      ? t('recovery.statusRefused')
                      : t('recovery.statusPending')
                }
              />
            </Box>
          ))}
        </VStack>

        {/* Progress */}
        <VStack spacing={2} style={{ marginTop: theme.spacing[4] }}>
          <ProgressBar value={approvedCount / 2} />
          <Text variant="caption" color="textSoft">
            {t('recovery.approvalsNeeded', { count: approvedCount })}
          </Text>
        </VStack>

        {/* Delay notice */}
        <Box bg="pale" radius="lg" p={3} style={{ marginTop: theme.spacing[4] }}>
          <Text variant="caption" color="text">
            {t('recovery.securityDelay')}
          </Text>
        </Box>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* CTA */}
        <VStack spacing={3} style={{ marginBottom: theme.spacing[8] }}>
          {!notified ? (
            <Pressable
              onPress={handleNotify}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.full,
                paddingVertical: theme.spacing[4],
                alignItems: 'center',
              }}
              accessibilityLabel={t('recovery.notifyGuardians')}
            >
              <Text color="textOnPrimary" weight="semibold">
                {t('recovery.notifyGuardians')}
              </Text>
            </Pressable>
          ) : isComplete ? (
            <>
              <Text variant="body" color="primary" align="center" weight="semibold">
                {t('recovery.notificationsSent')}
              </Text>
              <Pressable
                onPress={handleRecover}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.full,
                  paddingVertical: theme.spacing[4],
                  alignItems: 'center',
                }}
                accessibilityLabel={t('recovery.recoverAccount')}
              >
                <Text color="textOnPrimary" weight="semibold">
                  {t('recovery.recoverAccount')}
                </Text>
              </Pressable>
            </>
          ) : (
            <Text variant="body" color="textSoft" align="center">
              {t('recovery.notificationsSent')}
            </Text>
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
});
