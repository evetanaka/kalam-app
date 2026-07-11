import type { StateStorage } from 'zustand/middleware'

/**
 * Platform-agnostic storage adapter for Zustand persist middleware.
 *
 * - Mobile (React Native): uses MMKV via react-native-mmkv
 * - Web: uses localStorage
 *
 * The adapter is selected at runtime based on platform detection.
 * Import `storageAdapter` and pass it as the `storage` option in persist().
 */

const isReactNative =
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

/**
 * Web storage adapter using localStorage.
 */
const webStorage: StateStorage = {
  getItem: (name: string) => {
    const value = localStorage.getItem(name)
    return value ?? null
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value)
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
  },
}

/**
 * React Native MMKV storage adapter.
 * Lazy-loaded to avoid import errors on web.
 */
const createMMKVStorage = (): StateStorage => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require('react-native-mmkv') as { MMKV: new () => { getString: (k: string) => string | undefined; set: (k: string, v: string) => void; delete: (k: string) => void } }
  const mmkv = new MMKV()
  return {
    getItem: (name: string) => mmkv.getString(name) ?? null,
    setItem: (name: string, value: string) => mmkv.set(name, value),
    removeItem: (name: string) => mmkv.delete(name),
  }
}

/**
 * The storage adapter to use with zustand persist middleware.
 */
export const storageAdapter: StateStorage = isReactNative
  ? createMMKVStorage()
  : webStorage
