import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@kalam/theme';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step?: number;
  totalSteps?: number;
  showBack?: boolean;
  bg?: 'background' | 'primaryDeep';
}

export function OnboardingLayout({
  children,
  step,
  totalSteps = 6,
  showBack = false,
  bg = 'background',
}: OnboardingLayoutProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 50);
    return () => clearTimeout(timer);
  }, []);

  const isDark = bg === 'primaryDeep';
  const bgColor = bg === 'primaryDeep' ? theme.colors.primaryDeep : theme.colors.background;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: bgColor,
    }}>
      {showBack && (
        <div style={{ padding: '16px 16px 8px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.xl,
              color: isDark ? theme.colors.textOnPrimary : theme.colors.text,
              minHeight: 44,
              minWidth: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            aria-label="Retour"
          >
            ←
          </button>
        </div>
      )}

      <div style={{
        flex: 1,
        opacity,
        transition: `opacity ${theme.animations.slow}ms ease`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}>
        {children}
      </div>

      {step != null && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          paddingBottom: theme.spacing[8],
        }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i === step
                    ? isDark ? theme.colors.textOnPrimary : theme.colors.primary
                    : isDark ? 'rgba(255,255,255,0.3)' : theme.colors.border,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
