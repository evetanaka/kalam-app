import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageAdapter } from './storageAdapter'

/** App color theme. */
export type ThemeMode = 'light' | 'dark' | 'system'

/** Supported languages. */
export type Language = 'fr' | 'en'

/** Last seen visibility. */
export type LastSeenVisibility = 'everyone' | 'contacts' | 'nobody'

/** Profile photo visibility. */
export type ProfilePhotoVisibility = 'everyone' | 'contacts' | 'nobody'

/** Notification settings. */
export interface NotificationSettings {
  /** Enable push notifications */
  enabled: boolean
  /** Show message preview in notification */
  showPreview: boolean
  /** Sound enabled */
  sound: boolean
  /** Vibration enabled */
  vibration: boolean
  /** Mute all notifications temporarily (until timestamp, 0 = not muted) */
  mutedUntil: number
}

/** Privacy settings. */
export interface PrivacySettings {
  /** Who can see last seen status */
  lastSeen: LastSeenVisibility
  /** Who can see profile photo */
  profilePhoto: ProfilePhotoVisibility
  /** Who can see status/about */
  status: LastSeenVisibility
  /** Read receipts enabled (blue checks) */
  readReceipts: boolean
  /** Block screenshots in the app */
  blockScreenshots: boolean
}

export interface SettingsState {
  /** Color theme preference */
  theme: ThemeMode
  /** UI language */
  language: Language
  /** Notification preferences */
  notifications: NotificationSettings
  /** Privacy preferences */
  privacy: PrivacySettings
  /** Font size multiplier (1.0 = default) */
  fontScale: number
  /** Whether to auto-download media on WiFi */
  autoDownloadWifi: boolean
  /** Whether to auto-download media on cellular */
  autoDownloadCellular: boolean

  /** Update theme */
  setTheme: (theme: ThemeMode) => void
  /** Update language */
  setLanguage: (language: Language) => void
  /** Update notification settings */
  updateNotifications: (updates: Partial<NotificationSettings>) => void
  /** Update privacy settings */
  updatePrivacy: (updates: Partial<PrivacySettings>) => void
  /** Set font scale */
  setFontScale: (scale: number) => void
  /** Toggle auto-download */
  setAutoDownloadWifi: (enabled: boolean) => void
  setAutoDownloadCellular: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'fr',
      notifications: {
        enabled: true,
        showPreview: true,
        sound: true,
        vibration: true,
        mutedUntil: 0,
      },
      privacy: {
        lastSeen: 'contacts',
        profilePhoto: 'contacts',
        status: 'contacts',
        readReceipts: true,
        blockScreenshots: false,
      },
      fontScale: 1.0,
      autoDownloadWifi: true,
      autoDownloadCellular: false,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      updateNotifications: (updates) =>
        set((state) => ({
          notifications: { ...state.notifications, ...updates },
        })),
      updatePrivacy: (updates) =>
        set((state) => ({
          privacy: { ...state.privacy, ...updates },
        })),
      setFontScale: (fontScale) => set({ fontScale }),
      setAutoDownloadWifi: (autoDownloadWifi) => set({ autoDownloadWifi }),
      setAutoDownloadCellular: (autoDownloadCellular) => set({ autoDownloadCellular }),
    }),
    {
      name: 'kalam-settings',
      storage: storageAdapter,
    },
  ),
)
