import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { useAuthStore } from '@kalam/stores';
import { Text, Pressable, Input, Spinner, VStack, HStack } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

type RestoreState = 'idle' | 'searching' | 'found' | 'notFound';

/**
 * S-07: Restore Account — find existing .kalam account.
 */
export default function RestoreAccountScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [state, setState] = useState<RestoreState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(() => {
    if (name.length < 3) return;
    setState('searching');

    // Simulate search
    setTimeout(() => {
      // Mock: names starting with 'reda' are found
      if (name.startsWith('reda')) {
        setState('found');
      } else {
        setState('notFound');
      }
    }, 1200);
  }, [name]);

  const handleLogin = useCallback(() => {
    useAuthStore.getState().setPasskey({ credentialId: 'restored-' + Date.now() });
    useAuthStore.getState().login({
      address: '0x' + 'c'.repeat(40),
      name,
    });
    router.push('/auth/sync-history');
  }, [name, router]);

  const handleStartFresh = useCallback(() => {
    Alert.alert(
      t('common.confirm'),
      t('sync.startFreshWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.yes'), onPress: () => router.push('/auth/choose-name') },
      ]
    );
  }, [router, t]);

  const renderStatus = () => {
    switch (state) {
      case 'searching':
        return (
          <HStack spacing={2} align="center">
            <Spinner size="small" />
            <Text variant="caption" color="textSoft">{t('restore.searching')}</Text>
          </HStack>
        );
      case 'found':
        return (
          <Text variant="caption" color="primary">{t('restore.found')}</Text>
        );
      case 'notFound':
        return (
          <Text variant="caption" color="danger">{t('restore.notFound')}</Text>
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout showBack>
      <View style={[styles.content, { paddingHorizontal: theme.spacing[6] }]}>
        {/* Header */}
        <VStack spacing={3}>
          <Text variant="h2">{t('restore.title')}</Text>
        </VStack>

        {/* Input */}
        <VStack spacing={2} style={{ marginTop: theme.spacing[8] }}>
          <Input
            value={name}
            onChange={setName}
            placeholder={t('restore.placeholder')}
            autoCapitalize="none"
            autoCorrect={false}
            suffix={
              <Text variant="body" color="primary" weight="semibold">.kalam</Text>
            }
          />
          <View style={{ minHeight: 24 }}>{renderStatus()}</View>
        </VStack>

        {/* CTA for search / login */}
        <VStack spacing={3} style={{ marginTop: theme.spacing[4] }}>
          {state !== 'found' ? (
            <Pressable
              onPress={handleSearch}
              disabled={name.length < 3 || state === 'searching'}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.full,
                paddingVertical: theme.spacing[4],
                alignItems: 'center',
              }}
              accessibilityLabel={t('restore.title')}
            >
              <Text color="textOnPrimary" weight="semibold">
                {t('restore.title')}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleLogin}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.full,
                paddingVertical: theme.spacing[4],
                alignItems: 'center',
              }}
              accessibilityLabel={t('restore.loginFaceId')}
            >
              <Text color="textOnPrimary" weight="semibold">
                {t('restore.loginFaceId')}
              </Text>
            </Pressable>
          )}
        </VStack>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Bottom links */}
        <VStack spacing={4} style={{ marginBottom: theme.spacing[8] }} align="center">
          {state === 'notFound' && (
            <Pressable
              onPress={() => router.push('/auth/social-recovery')}
              style={{ paddingVertical: theme.spacing[2] }}
            >
              <Text variant="body" color="primary" style={{ textDecorationLine: 'underline' }}>
                {t('restore.socialRecovery')}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleStartFresh}
            style={{ paddingVertical: theme.spacing[2] }}
          >
            <Text variant="caption" color="textSoft" style={{ textDecorationLine: 'underline' }}>
              {t('restore.qrSync')}
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
