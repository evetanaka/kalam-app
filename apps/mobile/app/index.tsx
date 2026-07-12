import { Redirect } from 'expo-router'

/**
 * Root index — redirects to the auth splash screen.
 * Once auth is implemented, this will check auth state
 * and redirect to (tabs) if logged in.
 */
export default function Index() {
  return <Redirect href="/auth/splash" />
}
