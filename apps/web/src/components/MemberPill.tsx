import React from 'react';
import { useTheme } from '@kalam/theme';
import { Avatar } from '@kalam/ui';

interface MemberPillProps {
  name: string;
  onRemove: () => void;
}

function MemberPillInner({ name, onRemove }: MemberPillProps) {
  const { theme } = useTheme();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      backgroundColor: theme.colors.pale,
      borderRadius: theme.radius.xl,
      paddingLeft: 4, paddingRight: 8,
      height: 32,
    }}>
      <Avatar size="xs" name={name} />
      <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.text }}>{name}</span>
      <button
        onClick={onRemove}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, color: theme.colors.textSoft, marginLeft: 4,
        }}
      >✕</button>
    </div>
  );
}

export const MemberPill = React.memo(MemberPillInner);
