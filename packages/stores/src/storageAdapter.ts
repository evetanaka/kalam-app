import type { StateStorage } from 'zustand/middleware'

/**
 * Platform-agnostic storage adapter for Zustand persist middleware.
 *
 * - Mobile (React Native): uses MMKV → AsyncStorage → in-memory fallback
 * - Web: uses localStorage
 *
 * The adapter is selected at runtime based on platform detection.
 */

const isReactNative =
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

/**
 * In-memory fallback storage (never crashes).
 */
const memoryStore = new Map<string, string>()
const memoryStorage: StateStorage = {
  getItem: (name: string) => memoryStore.get(name) ?? null,
  setItem: (name: string, value: string) => { memoryStore.set(name, value) },
  removeItem: (name: string) => { memoryStore.delete(name) },
}

/**
 * Web storage adapter using localStorage.
 */
const webStorage: StateStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name) ?? null
    } catch {
      return memoryStorage.getItem(name)
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      memoryStorage.setItem(name, value)
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name)
    } catch {
      memoryStorage.removeItem(name)
    }
  },
}

/**
 * React Native storage adapter.
 * Tries MMKV first (native build), falls back to AsyncStorage (Expo Go),
 * then to in-memory storage (absolute last resort).
 */
const createNativeStorage = (): StateStorage => {
  // Try MMKV
  try {
    const { MMKV } = require('react-native-mmkv') as {
      MMKV: new () => {
        getString: (k: string) => string | undefined
        set: (k: string, v: string) => void
        delete: (k: string) => void
      }
    }
    const mmkv = new MMKV()
    return {
      getItem: (name: string) => mmkv.getString(name) ?? null,
      setItem: (name: string, value: string) => mmkv.set(name, value),
      removeItem: (name: string) => mmkv.delete(name),
    }
  } catch {
    // MMKV not available
  }

  // Try AsyncStorage
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default as {
      getItem: (k: string) => Promise<string | null>
      setItem: (k: string, v: string) => Promise<void>
      removeItem: (k: string) => Promise<void>
    }
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      return {
        getItem: (name: string) => AsyncStorage.getItem(name),
        setItem: (name: string, value: string) => AsyncStorage.setItem(name, value),
        removeItem: (name: string) => AsyncStorage.removeItem(name),
      }
    }
  } catch {
    // AsyncStorage not available
  }

  // Last resort: in-memory
  console.warn('[storageAdapter] No persistent storage available, using in-memory fallback')
  return memoryStorage
}

/**
 * The storage adapter to use with zustand persist middleware.
 */
export const storageAdapter: StateStorage = isReactNative
  ? createNativeStorage()
  : webStorage
