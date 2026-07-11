import React from 'react'

interface PlaceholderPageProps {
  id: string
  title: string
}

export function PlaceholderPage({ id, title }: PlaceholderPageProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 24,
        backgroundColor: 'var(--bg)',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--soft)', letterSpacing: 1, marginBottom: 8 }}>
        {id}
      </span>
      <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--deep)', textAlign: 'center' }}>
        {title}
      </span>
    </div>
  )
}
