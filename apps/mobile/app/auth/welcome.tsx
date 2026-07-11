import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { useAuthStore, useWalletStore } from '@kalam/stores';
import { Text, Pressable, SecurityBadge, Box, VStack } from '@kalam/ui';
import { OnboardingLayout } from '../../components/OnboardingLayout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONFETTI_COUNT = 20;

/**
 * S-06: Welcome — reward screen with confetti and gift card.
 */
export default function WelcomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const account = useAuthStore((s) => s.account);
  const isDiscovery = useWalletStore((s) => s.isDiscoveryMode);

  // Confetti animation refs
  const confettiAnims = useRef(
    Array.from({ length: CONFETTI_COUNT }, () => ({
      y: new Animated.Value(-20),
      x: Math.random() * SCREEN_WIDTH,
      color: ['#1DAB61', '#F5C518', '#DC3545', '#1DAB61', '#F5C518'][
        Math.floor(Math.random() * 5)
      ],
      size: 6 + Math.random() * 6,
      delay: Math.random() * 1500,
    }))
  ).current;

  useEffect(() => {
    confettiAnims.forEach((c) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(c.delay),
          Animated.timing(c.y, {
            toValue: Dimensions.get('window').height + 20,
            duration: 2500 + Math.random() * 1500,
            useNativeDriver: true,
          }),
          Animated.timing(c.y, {
            toValue: -20,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handleStart = () => {
    useAuthStore.getState().setOnboarded();
    router.replace('/(tabs)');
  };

  const displayName = account?.name || 'kalam';

  return (
    <OnboardingLayout bg="background">
      {/* Confetti layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {confettiAnims.map((c, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: c.x,
              width: c.size,
              height: c.size,
              borderRadius: c.size / 2,
              backgroundColor: c.color,
              transform: [{ translateY: c.y }],
            }}
          />
        ))}
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing[6] }]}>
        {/* Welcome text */}
        <VStack spacing={3} align="center" style={styles.header}>
          <Text style={{ fontSize: 48 }}>🎉</Text>
          <Text variant="h2" align="center">
            {t('onboarding.welcome.title', { name: displayName })}
          </Text>
          <Text variant="body" color="textSoft" align="center">
            {isDiscovery
              ? t('onboarding.welcome.discoveryMode')
              : t('onboarding.welcome.subtitleReady')}
          </Text>
        </VStack>

        {/* Gift card */}
        <Box
          bg="accentLight"
          radius="xl"
          p={5}
          border
          style={{ alignItems: 'center', gap: theme.spacing[2] }}
        >
          <SecurityBadge />
          <Text variant="h3" align="center" style={{ marginTop: theme.spacing[2] }}>
            {isDiscovery
              ? t('onboarding.welcome.discoveryMode')
              : t('onboarding.welcome.yearsOfMessages', {
                  years: Math.round(
                    (useWalletStore.getState().balanceCents / 100 / 0.0001 / (365 * 50)) * 10
                  ) / 10 || '∞',
                })}
          </Text>
          <Text variant="caption" color="textSoft" align="center">
            {t('onboarding.welcome.subtitleReady')}
          </Text>
        </Box>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* CTA */}
        <Pressable
          onPress={handleStart}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            paddingVertical: theme.spacing[4],
            alignItems: 'center',
            marginBottom: theme.spacing[8],
          }}
          accessibilityLabel={t('onboarding.welcome.startChatting')}
        >
          <Text color="textOnPrimary" weight="semibold">
            {t('onboarding.welcome.startChatting')}
          </Text>
        </Pressable>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 80,
  },
  header: {
    marginBottom: 32,
  },
});
