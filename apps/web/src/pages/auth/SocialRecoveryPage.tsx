import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Text, VStack, Box, Badge, ProgressBar } from '@kalam/ui';
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

export function SocialRecoveryPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [guardians, setGuardians] = useState<Guardian[]>(INITIAL_GUARDIANS);
  const [notified, setNotified] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const approvedCount = guardians.filter((g) => g.status === 'approved').length;
  const isComplete = approvedCount >= 2;

  useEffect(() => {
    if (!notified) return;
    let count = 0;
    intervalRef.current = setInterval(() => {
      setGuardians((prev) => {
        const next = [...prev];
        const pendingIdx = next.findIndex((g) => g.status === 'pending');
        if (pendingIdx === -1) { clearInterval(intervalRef.current!); return prev; }
        next[pendingIdx] = { ...next[pendingIdx], status: 'approved' };
        count++;
        if (count >= 2) clearInterval(intervalRef.current!);
        return next;
      });
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [notified]);

  return (
    <OnboardingLayout showBack>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 24,
        paddingLeft: theme.spacing[6], paddingRight: theme.spacing[6],
        maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        <VStack spacing={3}>
          <Text variant="h2">{t('recovery.headline')}</Text>
          <Text variant="body" color="textSoft">{t('recovery.explanation')}</Text>
        </VStack>

        <VStack spacing={3} style={{ marginTop: theme.spacing[6] }}>
          {guardians.map((g, i) => (
            <Box key={i} bg="backgroundAlt" radius="lg" p={4} row style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="body" weight="semibold">{g.name}</Text>
              <Badge
                variant={g.status === 'approved' ? 'primary' : g.status === 'refused' ? 'danger' : 'subtle'}
                label={g.status === 'approved' ? t('recovery.statusApproved') : g.status === 'refused' ? t('recovery.statusRefused') : t('recovery.statusPending')}
              />
            </Box>
          ))}
        </VStack>

        <VStack spacing={2} style={{ marginTop: theme.spacing[4] }}>
          <ProgressBar value={approvedCount / 2} />
          <Text variant="caption" color="textSoft">{t('recovery.approvalsNeeded', { count: approvedCount })}</Text>
        </VStack>

        <Box bg="pale" radius="lg" p={3} style={{ marginTop: theme.spacing[4] }}>
          <Text variant="caption" color="text">{t('recovery.securityDelay')}</Text>
        </Box>

        <div style={{ flex: 1 }} />

        <VStack spacing={3} style={{ marginBottom: theme.spacing[8] }}>
          {!notified ? (
            <button onClick={() => setNotified(true)} style={{
              backgroundColor: theme.colors.primary, borderRadius: theme.radius.full,
              padding: `${theme.spacing[4]}px 0`, border: 'none', cursor: 'pointer', textAlign: 'center',
            }}>
              <Text color="textOnPrimary" weight="semibold">{t('recovery.notifyGuardians')}</Text>
            </button>
          ) : isComplete ? (
            <>
              <Text variant="body" color="primary" align="center" weight="semibold">{t('recovery.notificationsSent')}</Text>
              <button onClick={() => navigate('/auth/deposit')} style={{
                backgroundColor: theme.colors.primary, borderRadius: theme.radius.full,
                padding: `${theme.spacing[4]}px 0`, border: 'none', cursor: 'pointer', textAlign: 'center',
              }}>
                <Text color="textOnPrimary" weight="semibold">{t('recovery.recoverAccount')}</Text>
              </button>
            </>
          ) : (
            <Text variant="body" color="textSoft" align="center">{t('recovery.notificationsSent')}</Text>
          )}
        </VStack>
      </div>
    </OnboardingLayout>
  );
}
