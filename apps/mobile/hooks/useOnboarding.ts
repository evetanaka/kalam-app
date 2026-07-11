import { useCallback } from 'react';
import { useRouter } from 'expo-router';

/**
 * Onboarding step definitions and navigation helper.
 */

export const ONBOARDING_STEPS = [
  'splash',
  'create-account',
  'choose-name',
  'deposit',
  'import-contacts',
  'welcome',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

const STEP_ROUTES: Record<OnboardingStep, string> = {
  splash: '/auth/splash',
  'create-account': '/auth/create-account',
  'choose-name': '/auth/choose-name',
  deposit: '/auth/deposit',
  'import-contacts': '/auth/import-contacts',
  welcome: '/auth/welcome',
};

/**
 * Hook providing onboarding navigation utilities.
 */
export function useOnboarding(currentStep: OnboardingStep) {
  const router = useRouter();
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);

  const navigateNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      const nextStep = ONBOARDING_STEPS[nextIndex];
      router.push(STEP_ROUTES[nextStep] as any);
    }
  }, [currentIndex, router]);

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    step: currentIndex,
    totalSteps: ONBOARDING_STEPS.length,
    isFirst: currentIndex === 0,
    isLast: currentIndex === ONBOARDING_STEPS.length - 1,
    navigateNext,
    navigateBack,
  };
}
