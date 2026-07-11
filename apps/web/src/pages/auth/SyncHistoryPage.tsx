import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Text, ProgressBar, VStack, Box } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

type SyncState = 'waiting' | 'syncing' | 'done';

export function SyncHistoryPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<SyncState>('waiting');
  const [progress, setProgress] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const handleStartSync = useCallback(() => {
    setState('syncing');
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 0.05, 1);
        setMsgCount(Math.round(next * 1247));
        if (next >= 1) { clearInterval(intervalRef.current!); setState('done'); }
        return next;
      });
    }, 300);
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleStartFresh = useCallback(() => {
    if (window.confirm(t('sync.startFreshWarning'))) navigate('/auth/deposit');
  }, [navigate, t]);

  return (
    <OnboardingLayout showBack>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 24,
        paddingLeft: theme.spacing[6], paddingRight: theme.spacing[6],
        maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        <VStack spacing={3}>
          <Text variant="h2">{t('sync.title')}</Text>
          <Text variant="body" color="textSoft">{t('sync.instruction')}</Text>
        </VStack>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {state === 'waiting' && (
            <div onClick={handleStartSync} style={{ cursor: 'pointer' }}>
              <Box bg="backgroundAlt" radius="xl" p={8} center border style={{ width: 220, height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 48 }}>📱</span>
                <Text variant="caption" color="textSoft" align="center" style={{ marginTop: theme.spacing[3] }}>{t('sync.waitingConnection')}</Text>
              </Box>
            </div>
          )}
          {state === 'syncing' && (
            <VStack spacing={4} align="center" style={{ width: '100%' }}>
              <span style={{ fontSize: 48 }}>📲</span>
              <Text variant="body" color="primary" weight="semibold">{t('sync.connected')}</Text>
              <ProgressBar value={progress} />
              <Text variant="caption" color="textSoft">{t('sync.progress', { current: msgCount, total: 1247 })}</Text>
            </VStack>
          )}
          {state === 'done' && (
            <VStack spacing={3} align="center">
              <span style={{ fontSize: 48 }}>✅</span>
              <Text variant="h3" align="center">{t('sync.complete')}</Text>
              <Text variant="caption" color="textSoft">{t('sync.progress', { current: 1247, total: 1247 })}</Text>
            </VStack>
          )}
        </div>

        <VStack spacing={3} style={{ marginBottom: theme.spacing[8] }}>
          {state === 'done' && (
            <button onClick={() => navigate('/auth/deposit')} style={{
              backgroundColor: theme.colors.primary, borderRadius: theme.radius.full,
              padding: `${theme.spacing[4]}px 0`, border: 'none', cursor: 'pointer', textAlign: 'center',
            }}>
              <Text color="textOnPrimary" weight="semibold">{t('common.continue')}</Text>
            </button>
          )}
          {state !== 'syncing' && (
            <button onClick={handleStartFresh} style={{
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', padding: `${theme.spacing[2]}px 0`,
            }}>
              <Text variant="caption" color="textSoft" style={{ textDecorationLine: 'underline' }}>{t('sync.startFresh')}</Text>
            </button>
          )}
          {state === 'waiting' && (
            <Text variant="caption" color="danger" align="center">{t('sync.noOldDevice')}</Text>
          )}
        </VStack>
      </div>
    </OnboardingLayout>
  );
}
