import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageAdapter } from './storageAdapter'
import type { MessageStatus } from './messageStore'

/** A conversation (1:1 or group). */
export interface Conversation {
  /** Unique conversation identifier */
  id: string
  /** 'direct' for 1:1, 'group' for group chats */
  type: 'direct' | 'group'
  /** Display name (contact name or group name) */
  name: string
  /** Group avatar URL, or null for direct (use contact avatar) */
  avatarUrl: string | null
  /** Preview of the last message in this conversation */
  lastMessage: {
    text: string
    timestamp: number
    status: MessageStatus
    senderId: string
  } | null
  /** Number of unread messages */
  unreadCount: number
  /** Whether pinned to the top of the list */
  isPinned: boolean
  /** Whether notifications are muted */
  isMuted: boolean
  /** Whether ephemeral messages are enabled */
  isEphemeral: boolean
  /** Ephemeral message lifetime in seconds (if enabled) */
  ephemeralDuration?: number
  /** Member IDs (for groups) */
  memberIds: string[]
  /** Timestamp of last activity (for sorting) */
  updatedAt: number
}

export interface ConversationState {
  /** All conversations, sorted by updatedAt desc */
  conversations: Conversation[]
  /** Currently active/open conversation ID */
  activeConversationId: string | null

  /** Set the active conversation */
  setActive: (id: string | null) => void
  /** Add a new conversation */
  addConversation: (conversation: Conversation) => void
  /** Update an existing conversation by ID */
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  /** Remove a conversation */
  removeConversation: (id: string) => void
  /** Mark all messages in a conversation as read */
  markAsRead: (id: string) => void
  /** Toggle pin status */
  togglePin: (id: string) => void
  /** Toggle mute status */
  toggleMute: (id: string) => void
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversationId: null,

      setActive: (id) => set({ activeConversationId: id }),

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        })),

      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      removeConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        })),

      markAsRead: (id) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, unreadCount: 0 } : c,
          ),
        })),

      togglePin: (id) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c,
          ),
        })),

      toggleMute: (id) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isMuted: !c.isMuted } : c,
          ),
        })),
    }),
    {
      name: 'kalam-conversations',
      storage: storageAdapter,
    },
  ),
)
