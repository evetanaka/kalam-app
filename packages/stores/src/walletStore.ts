import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageAdapter } from './storageAdapter'

/** A settlement record (weekly batch). */
export interface Settlement {
  /** Unique settlement ID */
  id: string
  /** Week start date (ISO string) */
  weekStart: string
  /** Week end date (ISO string) */
  weekEnd: string
  /** Number of messages sent during the period */
  messageCount: number
  /** Total cost in EUR cents */
  costCents: number
  /** Cost per message in EUR cents */
  costPerMessage: number
  /** Settlement status */
  status: 'pending' | 'settled' | 'failed'
  /** On-chain transaction hash (if settled) */
  txHash: string | null
  /** Timestamp when settled */
  settledAt: number | null
  /** Breakdown: % burned, % relays, % treasury */
  distribution: {
    burnedPercent: number
    relaysPercent: number
    treasuryPercent: number
  }
}

/** A deposit/recharge transaction. */
export interface DepositTransaction {
  /** Unique transaction ID */
  id: string
  /** Amount in EUR cents */
  amountCents: number
  /** Amount in $KLM (micro units) */
  amountKlm: number
  /** Payment method used */
  method: 'apple_pay' | 'google_pay' | 'card' | 'bank_transfer' | 'crypto'
  /** Transaction status */
  status: 'pending' | 'confirmed' | 'failed'
  /** Timestamp */
  createdAt: number
  /** On-chain transaction hash */
  txHash: string | null
}

export interface WalletState {
  /** Total deposit balance in EUR cents */
  balanceCents: number
  /** Total deposit balance in $KLM (micro units) */
  balanceKlm: number
  /** Guarantee floor (80% of initial deposit) in EUR cents */
  guaranteeFloorCents: number
  /** Reserve (consumable portion) in EUR cents */
  reserveCents: number
  /** Initial deposit amount in EUR cents */
  initialDepositCents: number
  /** Current $KLM/EUR exchange rate */
  klmEurRate: number
  /** Messages sent this week (for settlement preview) */
  weeklyMessageCount: number
  /** Estimated weekly cost in EUR cents */
  weeklyEstimatedCostCents: number
  /** Settlement history */
  settlements: Settlement[]
  /** Deposit/recharge history */
  deposits: DepositTransaction[]
  /** Whether the reserve is below the warning threshold (10%) */
  isReserveLow: boolean
  /** Whether the user is in discovery mode (no deposit) */
  isDiscoveryMode: boolean
  /** Remaining free messages in discovery mode */
  discoveryMessagesLeft: number

  /** Set balance after deposit or settlement */
  setBalance: (balanceCents: number, balanceKlm: number) => void
  /** Record a new deposit */
  addDeposit: (deposit: DepositTransaction) => void
  /** Record a settlement */
  addSettlement: (settlement: Settlement) => void
  /** Update weekly message count */
  incrementWeeklyMessages: () => void
  /** Reset weekly counter (after settlement) */
  resetWeeklyMessages: () => void
  /** Set exchange rate */
  setKlmEurRate: (rate: number) => void
  /** Enter discovery mode */
  enterDiscoveryMode: () => void
  /** Decrement discovery messages */
  useDiscoveryMessage: () => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      balanceCents: 0,
      balanceKlm: 0,
      guaranteeFloorCents: 0,
      reserveCents: 0,
      initialDepositCents: 0,
      klmEurRate: 0,
      weeklyMessageCount: 0,
      weeklyEstimatedCostCents: 0,
      settlements: [],
      deposits: [],
      isReserveLow: false,
      isDiscoveryMode: false,
      discoveryMessagesLeft: 20,

      setBalance: (balanceCents, balanceKlm) =>
        set((state) => {
          const reserveCents = balanceCents - state.guaranteeFloorCents
          return {
            balanceCents,
            balanceKlm,
            reserveCents,
            isReserveLow: reserveCents <= state.initialDepositCents * 0.1,
          }
        }),

      addDeposit: (deposit) =>
        set((state) => ({
          deposits: [deposit, ...state.deposits],
          initialDepositCents:
            state.initialDepositCents === 0 ? deposit.amountCents : state.initialDepositCents,
          guaranteeFloorCents:
            state.guaranteeFloorCents === 0
              ? Math.round(deposit.amountCents * 0.8)
              : state.guaranteeFloorCents,
          isDiscoveryMode: false,
        })),

      addSettlement: (settlement) =>
        set((state) => ({
          settlements: [settlement, ...state.settlements],
        })),

      incrementWeeklyMessages: () =>
        set((state) => ({
          weeklyMessageCount: state.weeklyMessageCount + 1,
          weeklyEstimatedCostCents: (state.weeklyMessageCount + 1) * 0.01, // 0.0001€ per msg
        })),

      resetWeeklyMessages: () =>
        set({ weeklyMessageCount: 0, weeklyEstimatedCostCents: 0 }),

      setKlmEurRate: (rate) => set({ klmEurRate: rate }),

      enterDiscoveryMode: () => set({ isDiscoveryMode: true, discoveryMessagesLeft: 20 }),

      useDiscoveryMessage: () =>
        set((state) => ({
          discoveryMessagesLeft: Math.max(0, state.discoveryMessagesLeft - 1),
        })),
    }),
    {
      name: 'kalam-wallet',
      storage: storageAdapter,
    },
  ),
)
