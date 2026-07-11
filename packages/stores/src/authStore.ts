import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageAdapter } from './storageAdapter'

/** Account identity derived from the passkey. */
export interface Account {
  /** ERC-4337 smart account address */
  address: string
  /** Chosen .kalam display name */
  name: string
}

/** Passkey credential stored in the secure enclave / keychain. */
export interface Passkey {
  /** WebAuthn credential ID (base64url) */
  credentialId: string
}

export interface AuthState {
  /** Whether the user has a valid passkey session */
  isAuthenticated: boolean
  /** Whether the user has completed the onboarding flow (S-01 → S-06) */
  isOnboarded: boolean
  /** Current account identity, null if logged out */
  account: Account | null
  /** Passkey reference, null if not created yet */
  passkey: Passkey | null

  /** Authenticate with the given account identity */
  login: (account: Account) => void
  /** Clear session and reset auth state */
  logout: () => void
  /** Mark onboarding as complete */
  setOnboarded: () => void
  /** Store passkey credential reference */
  setPasskey: (passkey: Passkey) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isOnboarded: false,
      account: null,
      passkey: null,

      login: (account) => set({ isAuthenticated: true, account }),
      logout: () => set({ isAuthenticated: false, isOnboarded: false, account: null, passkey: null }),
      setOnboarded: () => set({ isOnboarded: true }),
      setPasskey: (passkey) => set({ passkey }),
    }),
    {
      name: 'kalam-auth',
      storage: storageAdapter,
    },
  ),
)
