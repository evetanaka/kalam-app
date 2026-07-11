import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';
import { useTranslation } from '@kalam/i18n';
import { Logo, Text } from '@kalam/ui';

export function SplashPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: theme.colors.primaryDeep,
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        opacity,
        transition: `opacity ${theme.animations.slow}ms ease`,
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Logo size="lg" />
          <Text
            variant="h2"
            align="center"
            style={{ color: theme.colors.textOnPrimary, marginTop: theme.spacing[4] }}
          >
            {t('onboarding.splash.title')}
          </Text>
          <Text
            variant="body"
            align="center"
            style={{ color: theme.colors.textOnPrimary, opacity: 0.85, marginTop: theme.spacing[2] }}
          >
            {t('onboarding.splash.subtitle')}
          </Text>
        </div>

        <div style={{
          paddingLeft: theme.spacing[6],
          paddingRight: theme.spacing[6],
          paddingBottom: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing[4],
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}>
          <button
            onClick={() => navigate('/auth/create')}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.full,
              padding: `${theme.spacing[4]}px 0`,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'center',
            }}
            aria-label={t('onboarding.splash.createAccount')}
          >
            <Text color="textOnPrimary" weight="semibold" size="md">
              {t('onboarding.splash.createAccount')}
            </Text>
          </button>

          <button
            onClick={() => navigate('/auth/restore')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: `${theme.spacing[2]}px 0`,
              textAlign: 'center',
            }}
            aria-label={t('onboarding.splash.existingAccount')}
          >
            <Text style={{
              color: theme.colors.textOnPrimary,
              opacity: 0.8,
              textDecorationLine: 'underline',
              fontSize: theme.typography.fontSize.sm,
            }}>
              {t('onboarding.splash.existingAccount')}
            </Text>
          </button>
        </div>
      </div>
    </div>
  );
}
