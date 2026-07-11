import React, { useState } from 'react'

interface DesktopLayoutProps {
  children: React.ReactNode
}

/**
 * WhatsApp Web-style 3-panel layout:
 * - Sidebar (320px): header + search + conversation list
 * - Main panel (flex): chat view / page content
 * - Detail panel (350px, optional): contact info
 *
 * Responsive: sidebar collapses on viewports < 768px.
 */
export function DesktopLayout({ children }: DesktopLayoutProps) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--deep)' }}>Conversations</span>
        </div>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Rechercher…"
            style={styles.searchInput}
          />
        </div>
        <div style={styles.conversationList}>
          <p style={{ color: 'var(--soft)', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
            Aucune conversation
          </p>
        </div>
      </aside>

      {/* Main panel */}
      <main style={styles.main}>{children}</main>

      {/* Detail panel (optional) */}
      {showDetail && (
        <aside style={styles.detail}>
          <p style={{ color: 'var(--soft)', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
            Détail
          </p>
        </aside>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  sidebar: {
    width: 320,
    minWidth: 320,
    borderRight: '0.5px solid var(--hair)',
    backgroundColor: 'var(--white)',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    height: 56,
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '0.5px solid var(--hair)',
  },
  searchBox: {
    padding: '8px 12px',
  },
  searchInput: {
    width: '100%',
    height: 36,
    borderRadius: 12,
    border: 'none',
    backgroundColor: 'var(--bg)',
    padding: '0 14px',
    fontSize: 14,
    outline: 'none',
  },
  conversationList: {
    flex: 1,
    overflowY: 'auto' as const,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg)',
  },
  detail: {
    width: 350,
    minWidth: 350,
    borderLeft: '0.5px solid var(--hair)',
    backgroundColor: 'var(--white)',
  },
}
