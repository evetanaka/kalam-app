import React from 'react';
import { View, Image, type ImageSourcePropType } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Text } from './Text';

const SIZES = { sm: 32, md: 44, lg: 64 } as const;

export interface AvatarProps {
  /** Avatar size preset */
  size?: keyof typeof SIZES;
  /** Image source */
  source?: ImageSourcePropType;
  /** Name for initials fallback */
  name?: string;
  /** Border radius (default 12 = Kalam brand) */
  radius?: number;
  /** Show online status dot */
  showStatus?: boolean;
  /** Online status */
  online?: boolean;
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

/**
 * Avatar component showing an image or initials fallback.
 * Default border-radius is 12px (Kalam brand identity).
 */
export function Avatar({
  size = 'md',
  source,
  name,
  radius = 12,
  showStatus,
  online,
}: AvatarProps) {
  const { theme: t } = useTheme();
  const px = SIZES[size];

  return (
    <View style={{ width: px, height: px, position: 'relative' }}>
      {source ? (
        <Image
          source={source}
          style={{ width: px, height: px, borderRadius: radius }}
          accessibilityRole="image"
          accessibilityLabel={name ?? 'Avatar'}
        />
      ) : (
        <View
          style={{
            width: px,
            height: px,
            borderRadius: radius,
            backgroundColor: t.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="image"
          accessibilityLabel={name ?? 'Avatar'}
        >
          <Text
            variant="label"
            color="textOnPrimary"
            style={{ fontSize: px * 0.38 }}
          >
            {name ? getInitials(name) : '?'}
          </Text>
        </View>
      )}
      {showStatus && (
        <View
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: px * 0.3,
            height: px * 0.3,
            borderRadius: px * 0.15,
            backgroundColor: online ? t.colors.primary : t.colors.textSoft,
            borderWidth: 2,
            borderColor: t.colors.background,
          }}
        />
      )}
    </View>
  );
}
