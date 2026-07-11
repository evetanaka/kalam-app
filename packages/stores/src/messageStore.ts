import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageAdapter } from './storageAdapter'

/** Delivery status of a message. */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read'

/** Content type of a message. */
export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'payment'
  | 'system'

/** A reaction on a message. */
export interface Reaction {
  /** Emoji character */
  emoji: string
  /** IDs of users who reacted with this emoji */
  userIds: string[]
}

/** A single message in a conversation. */
export interface Message {
  /** Unique message ID */
  id: string
  /** Conversation this message belongs to */
  conversationId: string
  /** Sender's account address */
  senderId: string
  /** Message text content */
  text: string
  /** Unix timestamp in milliseconds */
  timestamp: number
  /** Delivery status */
  status: MessageStatus
  /** Content type */
  type: MessageType
  /** ID of the quoted/replied-to message, if any */
  quotedMessageId?: string
  /** Reactions on this message */
  reactions: Reaction[]
  /** Whether this message will auto-delete */
  isEphemeral: boolean
  /** Unix timestamp when ephemeral message expires */
  expiresAt?: number
  /** For payment messages: amount in EUR cents */
  paymentAmount?: number
  /** For payment messages: note */
  paymentNote?: string
  /** Media URL (for image/video/audio/document) */
  mediaUrl?: string
  /** Whether the message failed to send */
  isFailed: boolean
}

export interface MessageState {
  /** Messages indexed by conversation ID */
  messagesByConversation: Record<string, Message[]>

  /** Add a message to a conversation */
  addMessage: (message: Message) => void
  /** Update a message (e.g., status change) */
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  /** Remove a message */
  removeMessage: (conversationId: string, messageId: string) => void
  /** Get messages for a conversation */
  getMessages: (conversationId: string) => Message[]
  /** Add a reaction to a message */
  addReaction: (conversationId: string, messageId: string, emoji: string, userId: string) => void
  /** Remove a reaction from a message */
  removeReaction: (conversationId: string, messageId: string, emoji: string, userId: string) => void
  /** Clear all messages for a conversation */
  clearConversation: (conversationId: string) => void
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messagesByConversation: {},

      addMessage: (message) =>
        set((state) => {
          const existing = state.messagesByConversation[message.conversationId] ?? []
          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [message.conversationId]: [...existing, message],
            },
          }
        }),

      updateMessage: (conversationId, messageId, updates) =>
        set((state) => {
          const messages = state.messagesByConversation[conversationId] ?? []
          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m,
              ),
            },
          }
        }),

      removeMessage: (conversationId, messageId) =>
        set((state) => {
          const messages = state.messagesByConversation[conversationId] ?? []
          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: messages.filter((m) => m.id !== messageId),
            },
          }
        }),

      getMessages: (conversationId) =>
        get().messagesByConversation[conversationId] ?? [],

      addReaction: (conversationId, messageId, emoji, userId) =>
        set((state) => {
          const messages = state.messagesByConversation[conversationId] ?? []
          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: messages.map((m) => {
                if (m.id !== messageId) return m
                const existing = m.reactions.find((r) => r.emoji === emoji)
                if (existing) {
                  return {
                    ...m,
                    reactions: m.reactions.map((r) =>
                      r.emoji === emoji
                        ? { ...r, userIds: [...r.userIds, userId] }
                        : r,
                    ),
                  }
                }
                return { ...m, reactions: [...m.reactions, { emoji, userIds: [userId] }] }
              }),
            },
          }
        }),

      removeReaction: (conversationId, messageId, emoji, userId) =>
        set((state) => {
          const messages = state.messagesByConversation[conversationId] ?? []
          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: messages.map((m) => {
                if (m.id !== messageId) return m
                return {
                  ...m,
                  reactions: m.reactions
                    .map((r) =>
                      r.emoji === emoji
                        ? { ...r, userIds: r.userIds.filter((id) => id !== userId) }
                        : r,
                    )
                    .filter((r) => r.userIds.length > 0),
                }
              }),
            },
          }
        }),

      clearConversation: (conversationId) =>
        set((state) => {
          const { [conversationId]: _, ...rest } = state.messagesByConversation
          return { messagesByConversation: rest }
        }),
    }),
    {
      name: 'kalam-messages',
      storage: storageAdapter,
    },
  ),
)
