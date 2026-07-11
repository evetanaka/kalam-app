/**
 * 12 predefined colors for group member names.
 * Readable on both light and dark backgrounds.
 */
const MEMBER_COLORS = [
  '#E57373', // red
  '#F06292', // pink
  '#BA68C8', // purple
  '#7986CB', // indigo
  '#4FC3F7', // light blue
  '#4DD0E1', // cyan
  '#81C784', // green
  '#AED581', // light green
  '#FFD54F', // amber
  '#FF8A65', // deep orange
  '#A1887F', // brown
  '#90A4AE', // blue grey
] as const;

/** Simple string hash → stable index */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Get a stable color for a group member based on their ID.
 * Same memberId always returns the same color.
 */
export function memberColor(memberId: string): string {
  return MEMBER_COLORS[hashString(memberId) % MEMBER_COLORS.length];
}
