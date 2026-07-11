import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageAdapter } from './storageAdapter'

/** A contact in the user's address book. */
export interface Contact {
  /** Smart account address (unique identifier) */
  id: string
  /** Display name */
  name: string
  /** .kalam username */
  kalamName: string
  /** Avatar URL */
  avatarUrl: string | null
  /** Status message */
  status: string
  /** Whether keys have been verified (QR/60 digits) */
  isVerified: boolean
  /** Whether this contact is blocked */
  isBlocked: boolean
  /** Whether currently online (if privacy allows) */
  isOnline: boolean
  /** Phone number hash (for contact matching) */
  phoneHash: string | null
  /** When the contact was added */
  addedAt: number
}

export interface ContactState {
  /** All contacts */
  contacts: Contact[]

  /** Add a contact */
  addContact: (contact: Contact) => void
  /** Update a contact */
  updateContact: (id: string, updates: Partial<Contact>) => void
  /** Remove a contact */
  removeContact: (id: string) => void
  /** Block/unblock a contact */
  toggleBlock: (id: string) => void
  /** Find a contact by .kalam name */
  findByKalamName: (name: string) => Contact | undefined
}

export const useContactStore = create<ContactState>()(
  persist(
    (set, get) => ({
      contacts: [],

      addContact: (contact) =>
        set((state) => ({ contacts: [...state.contacts, contact] })),

      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      removeContact: (id) =>
        set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),

      toggleBlock: (id) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, isBlocked: !c.isBlocked } : c,
          ),
        })),

      findByKalamName: (name) => get().contacts.find((c) => c.kalamName === name),
    }),
    {
      name: 'kalam-contacts',
      storage: storageAdapter,
    },
  ),
)
