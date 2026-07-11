import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@kalam/theme';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { ProgressBar } from '../feedback/ProgressBar';

export interface AudioPlayerProps {
  uri: string;
  /** Duration in seconds */
  duration: number;
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** Audio player with waveform placeholder, play/pause, and duration. */
export function AudioPlayer({ uri, duration }: AudioPlayerProps) {
  const { theme: t } = useTheme();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing[3],
        paddingVertical: t.spacing[1],
      }}
      accessibilityRole="none"
      accessibilityLabel="Audio message"
    >
      <Pressable
        onPress={() => setPlaying(!playing)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: t.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessibilityLabel={playing ? 'Pause' : 'Play'}
      >
        <Text color="textOnPrimary" weight="bold">{playing ? '⏸' : '▶'}</Text>
      </Pressable>
      <View style={{ flex: 1, gap: t.spacing[1] }}>
        <ProgressBar value={progress} color="primary" height={3} />
        {/* Waveform bars placeholder */}
        <View style={{ flexDirection: 'row', gap: 1, height: 20, alignItems: 'flex-end' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4 + Math.random() * 16,
                backgroundColor: i / 30 < progress ? t.colors.primary : t.colors.border,
                borderRadius: 1,
              }}
            />
          ))}
        </View>
      </View>
      <Text variant="caption" color="textSoft">{formatDuration(duration)}</Text>
    </View>
  );
}
