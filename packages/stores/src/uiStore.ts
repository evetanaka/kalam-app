import { create } from 'zustand'

/** Active modal identifier. */
export type ModalType =
  | 'none'
  | 'payment'          // S-24
  | 'ephemeral'        // S-21
  | 'forward'          // S-22
  | 'report'           // S-64
  | 'attachment'       // S-65
  | 'reaction'         // S-66
  | 'stake'            // S-27
  | 'invite'           // S-39
  | 'delete-confirm'   // S-63

/** Active bottom sheet identifier. */
export type SheetType =
  | 'none'
  | 'conversation-actions'
  | 'message-context'
  | 'contact-actions'

export interface UiState {
  /** Currently open modal */
  activeModal: ModalType
  /** Data payload for the active modal */
  modalData: Record<string, unknown> | null
  /** Currently open bottom sheet */
  activeSheet: SheetType
  /** Data payload for the active sheet */
  sheetData: Record<string, unknown> | null
  /** Global loading indicator */
  isLoading: boolean
  /** Loading message */
  loadingMessage: string | null
  /** Toast/snackbar message queue */
  toasts: Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>
  /** Whether the search bar is open */
  isSearchOpen: boolean
  /** Current search query */
  searchQuery: string
  /** Keyboard height (for input positioning on mobile) */
  keyboardHeight: number

  /** Open a modal */
  openModal: (modal: ModalType, data?: Record<string, unknown>) => void
  /** Close the current modal */
  closeModal: () => void
  /** Open a bottom sheet */
  openSheet: (sheet: SheetType, data?: Record<string, unknown>) => void
  /** Close the current sheet */
  closeSheet: () => void
  /** Set loading state */
  setLoading: (loading: boolean, message?: string) => void
  /** Add a toast notification */
  addToast: (message: string, type?: 'info' | 'success' | 'error') => void
  /** Remove a toast by ID */
  removeToast: (id: string) => void
  /** Toggle search */
  toggleSearch: () => void
  /** Update search query */
  setSearchQuery: (query: string) => void
  /** Set keyboard height */
  setKeyboardHeight: (height: number) => void
}

let toastCounter = 0

export const useUiStore = create<UiState>()((set) => ({
  activeModal: 'none',
  modalData: null,
  activeSheet: 'none',
  sheetData: null,
  isLoading: false,
  loadingMessage: null,
  toasts: [],
  isSearchOpen: false,
  searchQuery: '',
  keyboardHeight: 0,

  openModal: (modal, data) => set({ activeModal: modal, modalData: data ?? null }),
  closeModal: () => set({ activeModal: 'none', modalData: null }),
  openSheet: (sheet, data) => set({ activeSheet: sheet, sheetData: data ?? null }),
  closeSheet: () => set({ activeSheet: 'none', sheetData: null }),
  setLoading: (isLoading, message) =>
    set({ isLoading, loadingMessage: message ?? null }),
  addToast: (message, type = 'info') => {
    const id = `toast-${++toastCounter}`
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  toggleSearch: () =>
    set((state) => ({
      isSearchOpen: !state.isSearchOpen,
      searchQuery: state.isSearchOpen ? '' : state.searchQuery,
    })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setKeyboardHeight: (keyboardHeight) => set({ keyboardHeight }),
}))
