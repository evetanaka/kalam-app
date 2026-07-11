import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { useAuthStore } from '@kalam/stores';
import { Text, Pressable, Input, Spinner, VStack, HStack } from '@kalam/ui';
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

/**
 * S-03: Choose Name — pick a .kalam username with availability check.
 */
export default function ChooseNameScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<NameStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleChange = useCallback((text: string) => {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setName(cleaned);
    setStatus('idle');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (cleaned.length < MIN_LENGTH) {
      setStatus('idle');
      return;
    }
    if (!validateName(cleaned)) {
      setStatus('invalid');
      return;
    }

    setStatus('checking');
    debounceRef.current = setTimeout(() => {
      // Mock: names starting with 'test' are taken
      const isTaken = cleaned.startsWith('test');
      setStatus(isTaken ? 'taken' : 'available');
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleConfirm = useCallback(() => {
    useAuthStore.getState().login({
      address: '0x' + 'a'.repeat(40),
      name,
    });
    router.push('/auth/deposit');
  }, [name, router]);

  const renderStatus = () => {
    switch (status) {
      case 'checking':
        return (
          <HStack spacing={2} align="center">
            <Spinner size="small" />
            <Text variant="caption" color="textSoft">{t('onboarding.chooseName.checking')}</Text>
          </HStack>
        );
      case 'available':
        return (
          <HStack spacing={1} align="center">
            <Text style={{ color: theme.colors.primary, fontSize: theme.typography.fontSize.md }}>✓</Text>
            <Text variant="caption" color="primary">{t('onboarding.chooseName.available')}</Text>
          </HStack>
        );
      case 'taken':
        return (
          <HStack spacing={1} align="center">
            <Text style={{ color: theme.colors.danger, fontSize: theme.typography.fontSize.md }}>✗</Text>
            <Text variant="caption" color="danger">{t('onboarding.chooseName.taken')}</Text>
          </HStack>
        );
      case 'invalid':
        return (
          <Text variant="caption" color="danger">{t('onboarding.chooseName.invalidFormat')}</Text>
        );
      default:
        return name.length > 0 && name.length < MIN_LENGTH ? (
          <Text variant="caption" color="textSoft">{t('onboarding.chooseName.tooShort')}</Text>
        ) : null;
    }
  };

  return (
    <OnboardingLayout showBack step={1} totalSteps={4}>
      <View style={[styles.content, { paddingHorizontal: theme.spacing[6] }]}>
        {/* Header */}
        <VStack spacing={3}>
          <Text variant="label" color="primary">
            {t('onboarding.chooseName.step')}
          </Text>
          <Text variant="h2">{t('onboarding.chooseName.title')}</Text>
          <Text variant="body" color="textSoft">
            {t('onboarding.chooseName.subtitle')}
          </Text>
        </VStack>

        {/* Input */}
        <VStack spacing={2} style={{ marginTop: theme.spacing[8] }}>
          <Input
            value={name}
            onChange={handleChange}
            placeholder={t('onboarding.chooseName.placeholder')}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={MAX_LENGTH}
            suffix={
              <Text variant="body" color="primary" weight="semibold">
                {t('onboarding.chooseName.suffix')}
              </Text>
            }
          />
          <View style={{ minHeight: 24 }}>{renderStatus()}</View>
          <Text variant="caption" color="textSoft">
            {t('onboarding.chooseName.rules')}
          </Text>
        </VStack>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* CTA */}
        <Pressable
          onPress={handleConfirm}
          disabled={status !== 'available'}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            paddingVertical: theme.spacing[4],
            alignItems: 'center',
            marginBottom: theme.spacing[8],
          }}
          accessibilityLabel={t('common.continue')}
        >
          <Text color="textOnPrimary" weight="semibold">
            {t('common.continue')}
          </Text>
        </Pressable>
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
