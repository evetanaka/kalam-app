import React from 'react'
import { View, Text } from 'react-native'

/**
 * Minimal root layout — testing if the app renders at all.
 * No workspace imports (@kalam/*) to isolate the issue.
 */
export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B5C3B', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700' }}>Kalam</Text>
      <Text style={{ color: '#fff', opacity: 0.7, fontSize: 16, marginTop: 8 }}>It works!</Text>
    </View>
  )
}
