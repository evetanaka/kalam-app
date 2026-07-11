import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="choose-name" />
      <Stack.Screen name="deposit" />
      <Stack.Screen name="import-contacts" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="restore-account" />
      <Stack.Screen name="social-recovery" />
      <Stack.Screen name="sync-history" />
    </Stack>
  )
}
