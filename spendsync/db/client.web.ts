import * as schema from './schema';
import type { Card, Subscription } from '../store/useStore';

const state = {
  cards: [] as Card[],
  subscriptions: [] as Subscription[],
  processedSMS: new Set<string>(),
};

const SEED_CARDS: Card[] = [
  {
    id: 'hdfc',
    bank: 'HDFC Bank',
    variant: 'HDFC INFINIA',
    last4: '4521',
    expiry: '08/27',
    network: 'Visa',
    gradient: ['from-[#8b1d1d]', 'via-[#e11d48]', 'to-[#4c0519]'],
    monthlySpend: 976,
  },
  {
    id: 'icici',
    bank: 'ICICI Bank',
    variant: 'ICICI EMERALDE',
    last4: '8834',
    expiry: '03/26',
    network: 'Mastercard',
    gradient: ['from-[#E65C00]', 'to-[#993D00]'],
    monthlySpend: 637,
  },
  {
    id: 'sbi',
    bank: 'State Bank of India',
    variant: 'SBI AURUM',
    last4: '2210',
    expiry: '11/28',
    network: 'RuPay',
    gradient: ['from-[#003366]', 'to-[#001A33]'],
    monthlySpend: 629,
  },
  {
    id: 'axis',
    bank: 'Axis Bank',
    variant: 'AXIS BANK MAGNUS',
    last4: '6603',
    expiry: '06/27',
    network: 'Visa',
    gradient: ['from-[#4A0E1C]', 'to-[#2D0911]'],
    monthlySpend: 1384,
  },
];

const SEED_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub_netflix', name: 'Netflix', cardId: 'hdfc', amount: 649, billingType: 'recurring', cycle: 'monthly', renewalDays: 3, category: 'Entertainment', icon: 'movie', status: 'urgent' },
  { id: 'sub_spotify', name: 'Spotify Premium', cardId: 'hdfc', amount: 119, billingType: 'recurring', cycle: 'monthly', renewalDays: 12, category: 'Entertainment', icon: 'music_note', status: 'safe' },
  { id: 'sub_prime', name: 'Amazon Prime', cardId: 'icici', amount: 1499, billingType: 'recurring', cycle: 'yearly', renewalDays: 45, category: 'Entertainment', icon: 'local_shipping', status: 'safe' },
  { id: 'sub_yt', name: 'YouTube Premium', cardId: 'hdfc', amount: 189, billingType: 'recurring', cycle: 'monthly', renewalDays: 6, category: 'Entertainment', icon: 'play_circle', status: 'warning' },
  { id: 'sub_hotstar', name: 'Disney+ Hotstar', cardId: 'icici', amount: 299, billingType: 'recurring', cycle: 'monthly', renewalDays: 2, category: 'Entertainment', icon: 'stars', status: 'urgent' },
  { id: 'sub_zomato', name: 'Zomato Pro', cardId: 'axis', amount: 299, billingType: 'trial', cycle: null, renewalDays: 4, category: 'Food', icon: 'restaurant', status: 'trial-urgent' },
  { id: 'sub_canva', name: 'Canva Pro', cardId: 'sbi', amount: 499, billingType: 'recurring', cycle: 'monthly', renewalDays: 18, category: 'Productivity', icon: 'palette', status: 'safe' },
  { id: 'sub_adobe', name: 'Adobe Creative Cloud', cardId: 'axis', amount: 4230, billingType: 'recurring', cycle: 'monthly', renewalDays: 22, category: 'Productivity', icon: 'brush', status: 'safe' },
  { id: 'sub_gone', name: 'Google One', cardId: 'sbi', amount: 130, billingType: 'recurring', cycle: 'monthly', renewalDays: 9, category: 'Cloud', icon: 'cloud', status: 'warning' },
  { id: 'sub_zoom', name: 'Zoom Pro', cardId: 'axis', amount: 1300, billingType: 'recurring', cycle: 'monthly', renewalDays: 14, category: 'Productivity', icon: 'video_camera_front', status: 'safe' },
  { id: 'sub_swiggy', name: 'Swiggy One', cardId: 'icici', amount: 299, billingType: 'recurring', cycle: 'quarterly', renewalDays: 30, category: 'Food', icon: 'fastfood', status: 'safe' },
  { id: 'sub_linkedin', name: 'LinkedIn Premium', cardId: 'axis', amount: 2999, billingType: 'recurring', cycle: 'monthly', renewalDays: 5, category: 'Professional', icon: 'work', status: 'warning' },
];

function cloneCard(card: Card): Card {
  return { ...card, gradient: [...card.gradient] };
}

function cloneSubscription(sub: Subscription): Subscription {
  return { ...sub };
}

function tableName(table: unknown): 'cards' | 'subscriptions' | 'processedSMS' | 'unknown' {
  if (table === schema.cards) return 'cards';
  if (table === schema.subscriptions) return 'subscriptions';
  if (table === schema.processedSMS) return 'processedSMS';
  return 'unknown';
}

function normalizeCardRow(row: any): Card {
  const rawGradient = row?.gradient;
  let gradient: string[] = [];
  if (Array.isArray(rawGradient)) {
    gradient = rawGradient;
  } else if (typeof rawGradient === 'string') {
    try {
      const parsed = JSON.parse(rawGradient);
      gradient = Array.isArray(parsed) ? parsed : [];
    } catch {
      gradient = [];
    }
  }

  return {
    id: String(row?.id ?? ''),
    bank: String(row?.bank ?? ''),
    variant: String(row?.variant ?? ''),
    last4: String(row?.last4 ?? ''),
    expiry: String(row?.expiry ?? ''),
    network: (row?.network ?? 'Visa') as Card['network'],
    gradient,
    monthlySpend: Number(row?.monthlySpend ?? row?.monthly_spend ?? 0),
  };
}

function normalizeSubscriptionRow(row: any): Subscription {
  const trialEndsAmount = row?.trialEndsAmount ?? row?.trial_ends_amount ?? undefined;
  return {
    id: String(row?.id ?? ''),
    name: String(row?.name ?? ''),
    cardId: String(row?.cardId ?? row?.card_id ?? ''),
    amount: Number(row?.amount ?? 0),
    billingType: (row?.billingType ?? row?.billing_type ?? 'recurring') as Subscription['billingType'],
    cycle: (row?.cycle ?? null) as Subscription['cycle'],
    renewalDays: Number(row?.renewalDays ?? row?.renewal_days ?? 0),
    trialEndsAmount: trialEndsAmount == null ? undefined : Number(trialEndsAmount),
    category: (row?.category ?? 'Other') as Subscription['category'],
    icon: String(row?.icon ?? 'receipt'),
    status: (row?.status ?? 'safe') as Subscription['status'],
  };
}

function upsertCard(card: Card): void {
  const index = state.cards.findIndex((c) => c.id === card.id);
  if (index >= 0) {
    state.cards[index] = cloneCard(card);
    return;
  }
  state.cards.push(cloneCard(card));
}

function upsertSubscription(sub: Subscription): void {
  const index = state.subscriptions.findIndex((s) => s.id === sub.id);
  if (index >= 0) {
    state.subscriptions[index] = cloneSubscription(sub);
    return;
  }
  state.subscriptions.push(cloneSubscription(sub));
}

export const db: any = {
  insert: (table: unknown) => ({
    values: async (input: any): Promise<void> => {
      const rows = Array.isArray(input) ? input : [input];
      const kind = tableName(table);

      if (kind === 'cards') {
        rows.map(normalizeCardRow).forEach(upsertCard);
        return;
      }

      if (kind === 'subscriptions') {
        rows.map(normalizeSubscriptionRow).forEach(upsertSubscription);
        return;
      }

      if (kind === 'processedSMS') {
        for (const row of rows) {
          if (row?.id != null) {
            state.processedSMS.add(String(row.id));
          }
        }
      }
    },
  }),
  delete: () => ({
    where: async (): Promise<void> => {},
  }),
};

export async function initDB(): Promise<void> {
  // No-op on web. The web build uses in-memory state to avoid SharedArrayBuffer requirements.
}

export async function seedIfEmpty(): Promise<void> {
  if (state.cards.length > 0) return;
  state.cards = SEED_CARDS.map(cloneCard);
  state.subscriptions = SEED_SUBSCRIPTIONS.map(cloneSubscription);
}

export async function fetchAllCards(): Promise<Card[]> {
  return state.cards.map(cloneCard);
}

export async function fetchAllSubscriptions(): Promise<Subscription[]> {
  return state.subscriptions.map(cloneSubscription);
}

export async function deleteSubscriptionById(id: string): Promise<void> {
  state.subscriptions = state.subscriptions.filter((sub) => sub.id !== id);
}
