import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ThemeProvider } from '@kalam/theme'
import '@kalam/i18n'

/**
 * Error boundary to catch JS crashes and display the error
 * instead of a white screen.
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 20, paddingTop: 80 }}>
          <Text style={{ color: '#ff4444', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Kalam crashed
          </Text>
          <ScrollView>
            <Text style={{ color: '#ff8888', fontSize: 14, fontFamily: 'Courier' }}>
              {this.state.error.message}
            </Text>
            <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Courier', marginTop: 12 }}>
              {this.state.error.stack}
            </Text>
          </ScrollView>
        </View>
      )
    }
    return this.props.children
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
