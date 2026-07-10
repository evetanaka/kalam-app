export const animations = {
  fast: 150,
  normal: 250,
  slow: 400,
  lockFlash: 200,
  easing: {
    ease: 'ease' as const,
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' as const,
  },
} as const;

export type Animations = typeof animations;
