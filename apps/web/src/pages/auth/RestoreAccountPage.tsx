import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { useAuthStore } from '@kalam/stores';
import { Text, Spinner, VStack, HStack, Input } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

type RestoreState = 'idle' | 'searching' | 'found' | 'notFound';

export function RestoreAccountPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [state, setState] = useState<RestoreState>('idle');

  const handleSearch = useCallback(() => {
    if (name.length < 3) return;
    setState('searching');
    setTimeout(() => {
      setState(name.startsWith('reda') ? 'found' : 'notFound');
    }, 1200);
  }, [name]);

  const handleLogin = useCallback(() => {
    useAuthStore.getState().setPasskey({ credentialId: 'restored-' + Date.now() });
    useAuthStore.getState().login({ address: '0x' + 'c'.repeat(40), name });
    navigate('/auth/sync');
  }, [name, navigate]);

  const handleStartFresh = useCallback(() => {
    if (window.confirm(t('sync.startFreshWarning'))) {
      navigate('/auth/name');
    }
  }, [navigate, t]);

  const renderStatus = () => {
    switch (state) {
      case 'searching':
        return <HStack spacing={2} align="center"><Spinner size="small" /><Text variant="caption" color="textSoft">{t('restore.searching')}</Text></HStack>;
      case 'found':
        return <Text variant="caption" color="primary">{t('restore.found')}</Text>;
      case 'notFound':
        return <Text variant="caption" color="danger">{t('restore.notFound')}</Text>;
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout showBack>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 24,
        paddingLeft: theme.spacing[6], paddingRight: theme.spacing[6],
        maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        <VStack spacing={3}>
          <Text variant="h2">{t('restore.title')}</Text>
        </VStack>

        <VStack spacing={2} style={{ marginTop: theme.spacing[8] }}>
          <Input
            value={name} onChange={setName}
            placeholder={t('restore.placeholder')}
            autoCapitalize="none" autoCorrect={false}
            suffix={<Text variant="body" color="primary" weight="semibold">.kalam</Text>}
          />
          <div style={{ minHeight: 24 }}>{renderStatus()}</div>
        </VStack>

        <VStack spacing={3} style={{ marginTop: theme.spacing[4] }}>
          {state !== 'found' ? (
            <button onClick={handleSearch} disabled={name.length < 3 || state === 'searching'} style={{
              backgroundColor: theme.colors.primary, borderRadius: theme.radius.full,
              padding: `${theme.spacing[4]}px 0`, border: 'none',
              cursor: name.length < 3 || state === 'searching' ? 'default' : 'pointer',
              opacity: name.length < 3 || state === 'searching' ? 0.5 : 1, textAlign: 'center',
            }}>
              <Text color="textOnPrimary" weight="semibold">{t('restore.title')}</Text>
            </button>
          ) : (
            <button onClick={handleLogin} style={{
              backgroundColor: theme.colors.primary, borderRadius: theme.radius.full,
              padding: `${theme.spacing[4]}px 0`, border: 'none', cursor: 'pointer', textAlign: 'center',
            }}>
              <Text color="textOnPrimary" weight="semibold">{t('restore.loginFaceId')}</Text>
            </button>
          )}
        </VStack>

        <div style={{ flex: 1 }} />

        <VStack spacing={4} style={{ marginBottom: theme.spacing[8] }} align="center">
          {state === 'notFound' && (
            <button onClick={() => navigate('/auth/recovery')} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: `${theme.spacing[2]}px 0`,
            }}>
              <Text variant="body" color="primary" style={{ textDecorationLine: 'underline' }}>{t('restore.socialRecovery')}</Text>
            </button>
          )}
          <button onClick={handleStartFresh} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: `${theme.spacing[2]}px 0`,
          }}>
            <Text variant="caption" color="textSoft" style={{ textDecorationLine: 'underline' }}>{t('restore.qrSync')}</Text>
          </button>
        </VStack>
      </div>
    </OnboardingLayout>
  );
}
