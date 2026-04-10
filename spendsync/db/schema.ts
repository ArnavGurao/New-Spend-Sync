// ── FILE: db/schema.ts ────────────────────────────────────────────────────────

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const cards = sqliteTable('cards', {
  id:           text('id').primaryKey(),
  bank:         text('bank').notNull(),
  variant:      text('variant').notNull(),
  last4:        text('last4').notNull(),
  expiry:       text('expiry').notNull(),
  network:      text('network').notNull(),
  gradient:     text('gradient').notNull(),   // JSON.stringify(string[])
  monthlySpend: real('monthly_spend').default(0),
  createdAt:    integer('created_at').notNull(),
});

export const subscriptions = sqliteTable('subscriptions', {
  id:              text('id').primaryKey(),
  name:            text('name').notNull(),
  cardId:          text('card_id').notNull(),
  amount:          real('amount').notNull(),
  billingType:     text('billing_type').notNull(),
  cycle:           text('cycle'),
  renewalDays:     integer('renewal_days').notNull(),
  trialEndsAmount: real('trial_ends_amount'),
  category:        text('category').notNull(),
  icon:            text('icon').notNull(),
  status:          text('status').notNull(),
  createdAt:       integer('created_at').notNull(),
});

export const processedSMS = sqliteTable('processed_sms', {
  id:          text('id').primaryKey(),
  processedAt: integer('processed_at').notNull(),
});

export const syncLog = sqliteTable('sync_log', {
  id:       integer('id').primaryKey({ autoIncrement: true }),
  syncedAt: integer('synced_at').notNull(),
  fetched:  integer('fetched').default(0),
  parsed:   integer('parsed').default(0),
  newCount: integer('new_count').default(0),
});
