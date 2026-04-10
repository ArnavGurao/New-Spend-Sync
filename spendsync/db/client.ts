// ── FILE: db/client.ts ────────────────────────────────────────────────────────

import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import type { Card, Subscription } from '../store/useStore';

const sqlite = SQLite.openDatabaseSync('spendsync.db');
export const db = drizzle(sqlite, { schema });

// ── SEED DATA ─────────────────────────────────────────────────────────────────
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
  { id: 'sub_netflix',  name: 'Netflix',             cardId: 'hdfc',  amount: 649,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 3,  category: 'Entertainment', icon: 'movie',          status: 'urgent'       },
  { id: 'sub_spotify',  name: 'Spotify Premium',     cardId: 'hdfc',  amount: 119,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 12, category: 'Entertainment', icon: 'music_note',     status: 'safe'         },
  { id: 'sub_prime',    name: 'Amazon Prime',         cardId: 'icici', amount: 1499, billingType: 'recurring', cycle: 'yearly',    renewalDays: 45, category: 'Entertainment', icon: 'local_shipping', status: 'safe'         },
  { id: 'sub_yt',       name: 'YouTube Premium',      cardId: 'hdfc',  amount: 189,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 6,  category: 'Entertainment', icon: 'play_circle',    status: 'warning'      },
  { id: 'sub_hotstar',  name: 'Disney+ Hotstar',      cardId: 'icici', amount: 299,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 2,  category: 'Entertainment', icon: 'stars',          status: 'urgent'       },
  { id: 'sub_zomato',   name: 'Zomato Pro',           cardId: 'axis',  amount: 299,  billingType: 'trial',     cycle: null,        renewalDays: 4,  category: 'Food',          icon: 'restaurant',     status: 'trial-urgent' },
  { id: 'sub_canva',    name: 'Canva Pro',             cardId: 'sbi',   amount: 499,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 18, category: 'Productivity',  icon: 'palette',        status: 'safe'         },
  { id: 'sub_adobe',    name: 'Adobe Creative Cloud', cardId: 'axis',  amount: 4230, billingType: 'recurring', cycle: 'monthly',   renewalDays: 22, category: 'Productivity',  icon: 'brush',          status: 'safe'         },
  { id: 'sub_gone',     name: 'Google One',           cardId: 'sbi',   amount: 130,  billingType: 'recurring', cycle: 'monthly',   renewalDays: 9,  category: 'Cloud',         icon: 'cloud',          status: 'warning'      },
  { id: 'sub_zoom',     name: 'Zoom Pro',             cardId: 'axis',  amount: 1300, billingType: 'recurring', cycle: 'monthly',   renewalDays: 14, category: 'Productivity',  icon: 'video_camera_front', status: 'safe'    },
  { id: 'sub_swiggy',   name: 'Swiggy One',           cardId: 'icici', amount: 299,  billingType: 'recurring', cycle: 'quarterly', renewalDays: 30, category: 'Food',          icon: 'fastfood',       status: 'safe'         },
  { id: 'sub_linkedin', name: 'LinkedIn Premium',     cardId: 'axis',  amount: 2999, billingType: 'recurring', cycle: 'monthly',   renewalDays: 5,  category: 'Professional',  icon: 'work',           status: 'warning'      },
];

// ── INIT ──────────────────────────────────────────────────────────────────────
export async function initDB(): Promise<void> {
  await sqlite.execAsync(`PRAGMA journal_mode = WAL;`);

  // Create tables manually (no drizzle-kit migrations in Expo Go managed workflow)
  await sqlite.execAsync(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      bank TEXT NOT NULL,
      variant TEXT NOT NULL,
      last4 TEXT NOT NULL,
      expiry TEXT NOT NULL,
      network TEXT NOT NULL,
      gradient TEXT NOT NULL,
      monthly_spend REAL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      card_id TEXT NOT NULL,
      amount REAL NOT NULL,
      billing_type TEXT NOT NULL,
      cycle TEXT,
      renewal_days INTEGER NOT NULL,
      trial_ends_amount REAL,
      category TEXT NOT NULL,
      icon TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS processed_sms (
      id TEXT PRIMARY KEY,
      processed_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      synced_at INTEGER NOT NULL,
      fetched INTEGER DEFAULT 0,
      parsed INTEGER DEFAULT 0,
      new_count INTEGER DEFAULT 0
    );
  `);
}

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select().from(schema.cards).limit(1);
  if (existing.length > 0) return;

  const now = Date.now();

  // Insert seed cards
  await db.insert(schema.cards).values(
    SEED_CARDS.map(c => ({
      id:           c.id,
      bank:         c.bank,
      variant:      c.variant,
      last4:        c.last4,
      expiry:       c.expiry,
      network:      c.network,
      gradient:     JSON.stringify(c.gradient),
      monthlySpend: c.monthlySpend,
      createdAt:    now,
    }))
  );

  // Insert seed subscriptions
  await db.insert(schema.subscriptions).values(
    SEED_SUBSCRIPTIONS.map(s => ({
      id:              s.id,
      name:            s.name,
      cardId:          s.cardId,
      amount:          s.amount,
      billingType:     s.billingType,
      cycle:           s.cycle ?? null,
      renewalDays:     s.renewalDays,
      trialEndsAmount: null,
      category:        s.category,
      icon:            s.icon,
      status:          s.status,
      createdAt:       now,
    }))
  );
}

// ── QUERIES ───────────────────────────────────────────────────────────────────
export async function fetchAllCards(): Promise<Card[]> {
  const rows = await db.select().from(schema.cards);
  return rows.map(r => ({
    id:          r.id,
    bank:        r.bank,
    variant:     r.variant,
    last4:       r.last4,
    expiry:      r.expiry,
    network:     r.network as Card['network'],
    gradient:    JSON.parse(r.gradient) as string[],
    monthlySpend: r.monthlySpend ?? 0,
  }));
}

export async function fetchAllSubscriptions(): Promise<Subscription[]> {
  const rows = await db.select().from(schema.subscriptions);
  return rows.map(r => ({
    id:              r.id,
    name:            r.name,
    cardId:          r.cardId,
    amount:          r.amount,
    billingType:     r.billingType as Subscription['billingType'],
    cycle:           r.cycle as Subscription['cycle'],
    renewalDays:     r.renewalDays,
    trialEndsAmount: r.trialEndsAmount ?? undefined,
    category:        r.category as Subscription['category'],
    icon:            r.icon,
    status:          r.status as Subscription['status'],
  }));
}

export async function deleteSubscriptionById(id: string): Promise<void> {
  await db.delete(schema.subscriptions).where(eq(schema.subscriptions.id, id));
}
