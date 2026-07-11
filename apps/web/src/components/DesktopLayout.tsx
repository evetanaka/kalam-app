import React from 'react';
import { useParams } from 'react-router-dom';
import { ConversationListPage } from '../pages/conversations/ConversationListPage';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

/**
 * WhatsApp Web-style layout:
 * - Sidebar (360px): conversation list
 * - Main panel (flex): chat view / page content
 */
export function DesktopLayout({ children }: DesktopLayoutProps) {
  const params = useParams<{ id: string }>();
  const activeId = params.id;

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <ConversationListPage activeId={activeId} />
      </aside>

      {/* Main panel */}
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  sidebar: {
    width: 360,
    minWidth: 360,
    borderRight: '0.5px solid var(--hair)',
    backgroundColor: 'var(--white)',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg)',
  },
};
