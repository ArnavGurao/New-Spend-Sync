// ── FILE: store/useStore.ts ───────────────────────────────────────────────────
// Zustand — UI state only. SQLite is the persistence layer.
// Reset on app restart, rehydrated from DB in _layout.tsx.

import { create } from 'zustand';
import type { ParsedSMS } from '../lib/smsSync';

// ── TYPE DEFINITIONS (exported for use across the app) ────────────────────────
export type BankName =
  | 'HDFC Bank'
  | 'ICICI Bank'
  | 'State Bank of India'
  | 'Axis Bank'
  | 'Kotak Mahindra Bank'
  | 'Yes Bank'
  | 'IndusInd Bank'
  | string;

export type Network = 'Visa' | 'Mastercard' | 'RuPay';

export interface Card {
  id: string;
  bank: BankName;
  variant: string;
  last4: string;
  expiry: string;
  network: Network;
  gradient: string[];
  monthlySpend: number;
}

export type Category =
  | 'Entertainment'
  | 'Food'
  | 'Shopping'
  | 'Travel'
  | 'Productivity'
  | 'Cloud'
  | 'Professional'
  | 'Other';

export type SubscriptionStatus = 'urgent' | 'warning' | 'trial-urgent' | 'safe';
export type BillingType = 'recurring' | 'trial';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  cardId: string;
  amount: number;
  billingType: BillingType;
  cycle: BillingCycle | null;
  renewalDays: number;
  trialEndsAmount?: number;
  category: Category;
  icon: string;
  status: SubscriptionStatus;
}

export interface SMSFlowState {
  pendingSMS: ParsedSMS | null;
  step: 1 | 2;
  billingType: BillingType | null;
  cycle: BillingCycle | null;
  trialEndDate: string | null;
}

// ── STORE ─────────────────────────────────────────────────────────────────────
interface AppStore {
  // Cached DB results
  cards: Card[];
  subscriptions: Subscription[];

  // UI state
  selectedCardId: string | null;
  alertFilter: 'all' | 'urgent' | 'trials';
  smsFlow: SMSFlowState;
  mockSMSQueue: ParsedSMS[];
  isLoading: boolean;

  // Toast
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';

  // Actions
  setCards: (cards: Card[]) => void;
  setSubscriptions: (subs: Subscription[]) => void;
  addSubscription: (sub: Subscription) => void;
  removeSubscription: (id: string) => void;
  addCard: (card: Card) => void;
  selectCard: (id: string | null) => void;
  setAlertFilter: (f: 'all' | 'urgent' | 'trials') => void;
  setSMSFlow: (patch: Partial<SMSFlowState>) => void;
  resetSMSFlow: () => void;
  shiftMockSMSQueue: () => void;
  setLoading: (v: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Computed
  totalMonthly: () => number;
  subsForCard: (cardId: string) => Subscription[];
  urgentCount: () => number;
}

const DEFAULT_SMS_FLOW: SMSFlowState = {
  pendingSMS: null,
  step: 1,
  billingType: null,
  cycle: null,
  trialEndDate: null,
};

export const useStore = create<AppStore>((set, get) => ({
  cards: [],
  subscriptions: [],
  selectedCardId: null,
  alertFilter: 'all',
  smsFlow: DEFAULT_SMS_FLOW,
  mockSMSQueue: [],
  isLoading: true,
  toastMessage: null,
  toastType: 'success',

  setCards: (cards) => set({ cards }),
  setSubscriptions: (subscriptions) => set({ subscriptions }),

  addSubscription: (sub) =>
    set((state) => ({ subscriptions: [...state.subscriptions, sub] })),

  removeSubscription: (id) =>
    set((state) => ({ subscriptions: state.subscriptions.filter((s) => s.id !== id) })),

  addCard: (card) =>
    set((state) => ({ cards: [...state.cards, card] })),

  selectCard: (selectedCardId) => set({ selectedCardId }),

  setAlertFilter: (alertFilter) => set({ alertFilter }),

  setSMSFlow: (patch) =>
    set((state) => ({ smsFlow: { ...state.smsFlow, ...patch } })),

  resetSMSFlow: () => set({ smsFlow: DEFAULT_SMS_FLOW }),

  shiftMockSMSQueue: () =>
    set((state) => ({ mockSMSQueue: state.mockSMSQueue.slice(1) })),

  setLoading: (isLoading) => set({ isLoading }),

  showToast: (message, type = 'success') =>
    set({ toastMessage: message, toastType: type }),

  hideToast: () => set({ toastMessage: null }),

  // ── Computed ──────────────────────────────────────────────────────────────
  totalMonthly: () => {
    const state = get();
    return state.subscriptions.reduce((sum, s) => {
      if (s.billingType === 'trial') return sum;
      if (s.cycle === 'monthly') return sum + s.amount;
      if (s.cycle === 'quarterly') return sum + s.amount / 3;
      if (s.cycle === 'yearly') return sum + s.amount / 12;
      return sum + s.amount;
    }, 0);
  },

  subsForCard: (cardId) => get().subscriptions.filter((s) => s.cardId === cardId),

  urgentCount: () =>
    get().subscriptions.filter((s) => s.status === 'urgent' || s.status === 'trial-urgent').length,
}));
