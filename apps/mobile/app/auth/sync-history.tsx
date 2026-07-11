import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Text, Pressable, ProgressBar, VStack, Box } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

type SyncState = 'waiting' | 'syncing' | 'done';

/**
 * S-09: Sync History — QR code to sync from another device.
 */
export default function SyncHistoryScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [state, setState] = useState<SyncState>('waiting');
  const [progress, setProgress] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const handleStartSync = useCallback(() => {
    setState('syncing');
    setProgress(0);
    setMsgCount(0);

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 0.05, 1);
        setMsgCount(Math.round(next * 1247));
        if (next >= 1) {
          clearInterval(intervalRef.current!);
          setState('done');
        }
        return next;
      });
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleDone = useCallback(() => {
    router.push('/auth/deposit');
  }, [router]);

  const handleStartFresh = useCallback(() => {
    Alert.alert(
      t('common.confirm'),
      t('sync.startFreshWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.yes'),
          onPress: () => router.push('/auth/deposit'),
        },
      ]
    );
  }, [router, t]);

  return (
    <OnboardingLayout showBack>
      <View style={[styles.content, { paddingHorizontal: theme.spacing[6] }]}>
        {/* Header */}
        <VStack spacing={3}>
          <Text variant="h2">{t('sync.title')}</Text>
          <Text variant="body" color="textSoft">
            {t('sync.instruction')}
          </Text>
        </VStack>

        {/* QR code area / sync progress */}
        <View style={styles.centerSection}>
          {state === 'waiting' && (
            <Pressable onPress={handleStartSync} accessibilityLabel="QR Code">
              <Box
                bg="backgroundAlt"
                radius="xl"
                p={8}
                center
                border
                style={{ width: 220, height: 220 }}
              >
                <Text style={{ fontSize: 48 }}>📱</Text>
                <Text variant="caption" color="textSoft" align="center" style={{ marginTop: theme.spacing[3] }}>
                  {t('sync.waitingConnection')}
                </Text>
              </Box>
            </Pressable>
          )}

          {state === 'syncing' && (
            <VStack spacing={4} align="center" style={{ width: '100%' }}>
              <Text style={{ fontSize: 48 }}>📲</Text>
              <Text variant="body" color="primary" weight="semibold">
                {t('sync.connected')}
              </Text>
              <ProgressBar value={progress} />
              <Text variant="caption" color="textSoft">
                {t('sync.progress', {
                  current: msgCount,
                  total: 1247,
                })}
              </Text>
            </VStack>
          )}

          {state === 'done' && (
            <VStack spacing={3} align="center">
              <Text style={{ fontSize: 48 }}>✅</Text>
              <Text variant="h3" align="center">
                {t('sync.complete')}
              </Text>
              <Text variant="caption" color="textSoft">
                {t('sync.progress', { current: 1247, total: 1247 })}
              </Text>
            </VStack>
          )}
        </View>

        {/* CTA */}
        <VStack spacing={3} style={{ marginBottom: theme.spacing[8] }}>
          {state === 'done' && (
            <Pressable
              onPress={handleDone}
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

          {state !== 'syncing' && (
            <Pressable
              onPress={handleStartFresh}
              style={{ alignItems: 'center', paddingVertical: theme.spacing[2] }}
            >
              <Text variant="caption" color="textSoft" style={{ textDecorationLine: 'underline' }}>
                {t('sync.startFresh')}
              </Text>
            </Pressable>
          )}

          {state === 'waiting' && (
            <Text variant="caption" color="danger" align="center">
              {t('sync.noOldDevice')}
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
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
