import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { useAuthStore } from '@kalam/stores';
import { Text, Spinner, VStack, HStack, Input } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

type NameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const NAME_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 20;

function validateName(name: string): boolean {
  if (name.length < MIN_LENGTH || name.length > MAX_LENGTH) return false;
  if (name.length === 1) return /^[a-z0-9]$/.test(name);
  if (name.length === 2) return /^[a-z0-9]{2}$/.test(name);
  return NAME_REGEX.test(name);
}

export function ChooseNamePage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<NameStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleChange = useCallback((text: string) => {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setName(cleaned);
    setStatus('idle');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (cleaned.length < MIN_LENGTH) { setStatus('idle'); return; }
    if (!validateName(cleaned)) { setStatus('invalid'); return; }

    setStatus('checking');
    debounceRef.current = setTimeout(() => {
      const isTaken = cleaned.startsWith('test');
      setStatus(isTaken ? 'taken' : 'available');
    }, 400);
  }, []);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleConfirm = useCallback(() => {
    useAuthStore.getState().login({ address: '0x' + 'a'.repeat(40), name });
    navigate('/auth/deposit');
  }, [name, navigate]);

  const renderStatus = () => {
    switch (status) {
      case 'checking':
        return <HStack spacing={2} align="center"><Spinner size="small" /><Text variant="caption" color="textSoft">{t('onboarding.chooseName.checking')}</Text></HStack>;
      case 'available':
        return <HStack spacing={1} align="center"><Text style={{ color: theme.colors.primary, fontSize: theme.typography.fontSize.md }}>✓</Text><Text variant="caption" color="primary">{t('onboarding.chooseName.available')}</Text></HStack>;
      case 'taken':
        return <HStack spacing={1} align="center"><Text style={{ color: theme.colors.danger, fontSize: theme.typography.fontSize.md }}>✗</Text><Text variant="caption" color="danger">{t('onboarding.chooseName.taken')}</Text></HStack>;
      case 'invalid':
        return <Text variant="caption" color="danger">{t('onboarding.chooseName.invalidFormat')}</Text>;
      default:
        return name.length > 0 && name.length < MIN_LENGTH ? <Text variant="caption" color="textSoft">{t('onboarding.chooseName.tooShort')}</Text> : null;
    }
  };

  return (
    <OnboardingLayout showBack step={1} totalSteps={4}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        paddingTop: 24, paddingLeft: theme.spacing[6], paddingRight: theme.spacing[6],
        maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        <VStack spacing={3}>
          <Text variant="label" color="primary">{t('onboarding.chooseName.step')}</Text>
          <Text variant="h2">{t('onboarding.chooseName.title')}</Text>
          <Text variant="body" color="textSoft">{t('onboarding.chooseName.subtitle')}</Text>
        </VStack>

        <VStack spacing={2} style={{ marginTop: theme.spacing[8] }}>
          <Input
            value={name}
            onChange={handleChange}
            placeholder={t('onboarding.chooseName.placeholder')}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={MAX_LENGTH}
            suffix={<Text variant="body" color="primary" weight="semibold">{t('onboarding.chooseName.suffix')}</Text>}
          />
          <div style={{ minHeight: 24 }}>{renderStatus()}</div>
          <Text variant="caption" color="textSoft">{t('onboarding.chooseName.rules')}</Text>
        </VStack>

        <div style={{ flex: 1 }} />

        <button
          onClick={handleConfirm}
          disabled={status !== 'available'}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            padding: `${theme.spacing[4]}px 0`,
            border: 'none',
            cursor: status === 'available' ? 'pointer' : 'default',
            opacity: status === 'available' ? 1 : 0.5,
            marginBottom: theme.spacing[8],
            textAlign: 'center',
          }}
        >
          <Text color="textOnPrimary" weight="semibold">{t('common.continue')}</Text>
        </button>
      </div>
    </OnboardingLayout>
  );
}
