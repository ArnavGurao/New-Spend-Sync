# SpendSync - Implementation README (Engineering Spec)

This document turns the prototype specification into an implementation-ready README for building SpendSync with the provided split-backend fintech stack.

- Prototype spec (source of truth for UI details): `README.md`
- Live prototype UI (reference implementation): `index.html`
- Canonical design tokens (colors, typography, gradients): `spendsync-design-system.json`

## Table of Contents

- [What Is SpendSync](#what-is-spendsync)
- [Product Goals](#product-goals)
- [Non-Goals (For MVP)](#non-goals-for-mvp)
- [User Personas and Roles](#user-personas-and-roles)
- [Key Screens (From Prototype)](#key-screens-from-prototype)
- [Core Flow (SMS -> Subscription)](#core-flow-sms---subscription)
- [Functional Requirements](#functional-requirements)
- [Architecture (Reference)](#architecture-reference)
- [Domain Model (Reference)](#domain-model-reference)
- [Seed Data (Prototype Alignment)](#seed-data-prototype-alignment)
- [Permissions, Privacy, and Compliance](#permissions-privacy-and-compliance)
- [Design System Requirements](#design-system-requirements)
- [Tech Stack (Confirmed)](#tech-stack-confirmed)
- [Repository Structure (Recommended)](#repository-structure-recommended)
- [Local Development](#local-development)
- [API Contracts (Draft)](#api-contracts-draft)
- [Database Schema (Draft)](#database-schema-draft)
- [Caching and Feature Store](#caching-and-feature-store)
- [AI and Optimization](#ai-and-optimization)
- [Deployment (Reference)](#deployment-reference)
- [Testing Strategy](#testing-strategy)
- [Milestones](#milestones)
- [Open Questions (Need Confirmation)](#open-questions-need-confirmation)

## What Is SpendSync

SpendSync is a real-time transaction intelligence and subscription leak detection system for Indian users. It turns unstructured bank signals (SMS alerts and statement PDFs) into structured transactions, then powers:

- A Savings Growth Dashboard (web UI)
- Best-card reward optimization (real-time recommendation)
- Subscription tracking, renewal forecasting, and leak detection
- (Phase) an AI Copilot for natural language queries over a user's own financial data

Core promise: minimal manual work after setup; ingestion pipelines do the "dirty work" of structuring data, and the system produces actionable insights.

## Product Goals

- Ingest and normalize transactions from:
  - Bank SMS alerts (regex + NLP extraction)
  - Bank statement PDFs (OCR + table extraction)
- Enrich transactions using external/proprietary datasets:
  - Credit card benefits database
  - Merchant database (normalization + category)
- Classify transactions into categories and behavioral segments (AI engine).
- Compute a real-time best-card recommendation for a merchant/transaction.
- Detect and track subscriptions; forecast renewals; surface leak risks.
- Alert users before renewals (default: 7d / 3d / 1d) and surface an urgency-sorted Alerts list.
- Provide per-card and overall spend views (Dashboard + Card Detail + Analytics).
- Advise which card to use for a merchant to maximize benefits (Optimal Card Advisor).
- Classify the user into a "Subscription DNA" persona from their subscription portfolio (DNA screen).
- Provide an AI Copilot (phase) for natural-language Q&A over the user's own data.

## Non-Goals (For MVP)

- No collection of full card number, CVV, or OTP. Only card identification metadata is stored.
- No direct bank logins. Source of truth is user-provided data (SMS, PDFs, and optional manual entry).
- No payments execution. "Auto-Pay" CTA in prototype is a UI stub unless explicitly implemented.

## User Personas and Roles

- End user: tracks cards and subscriptions, receives alerts, follows optimization advice.
- Admin/operator (optional): updates benefits DB and merchant/category mappings; monitors ingestion quality.

## Key Screens (From Prototype)

- Screen 01: Dashboard
- Screen 02: Card Detail (Subscription View)
- Screen 03: Add New Card
- Screen 04: Analytics
- Screen 05: Alerts
- Screen 06: Optimal Card Advisor
- Screen 07: Subscription DNA

See `README.md` for UI layout and motion spec per screen.

## Core Flow (SMS -> Subscription)

1. User installs app and completes onboarding.
2. User adds cards (bank name, last 4 digits, expiry, network).
3. User grants SMS permission (if using Android ingestion) or connects an ingestion method.
4. A new bank signal arrives (SMS alert) or the user uploads a bank statement PDF.
5. App parses SMS -> `ParsedCharge` (merchant, amount, cardLast4, bank, timestamp).
6. App shows an in-app toast, then opens a bottom sheet with the parsed preview.
7. User classifies the charge:
   - Recurring subscription: choose monthly/quarterly/yearly.
   - Free trial: choose trial end date.
8. App computes next renewal date and creates/updates a subscription.
9. App schedules renewal alerts (7d / 3d / 1d before renewal by default).
10. Dashboard, Alerts, and Analytics update immediately.

## Functional Requirements

### Global UX Rules (Prototype-Driven)

- Dark-first UI only.
- "Card" surfaces use pill geometry everywhere (the prototype uses `rounded-full`).
- Press feedback on all interactive elements (prototype uses `active:scale-95`).
- Typography: Manrope for headings, Inter for body.

### Onboarding

- Explain the value prop and the one-time setup.
- Collect minimal profile: name (optional) and locale/timezone.
- Gate SMS permission request behind an explicit consent screen.

Acceptance criteria:
- User can use the app without SMS permission by adding subscriptions manually (fallback path).
- If SMS permission is denied, show a persistent but non-blocking banner with "Enable SMS" CTA.

### Card Management

Card fields (store only metadata):
- `bankName` (required)
- `variant` (optional)
- `lastFour` (required, exactly 4 digits)
- `expiry` (required for UI; not required for tracking)
- `network` (Visa/Mastercard/RuPay)
- `gradientKey` (derived from bank, used for UI styling)

Constraints:
- Never request full PAN or CVV.
- Mask card numbers in UI (`XXXX XXXX XXXX 4521` or `.... 4521`).

Acceptance criteria:
- Creating a card fails validation unless bank, last-4, and expiry are present.
- A card can be edited and deleted, and deletions handle dependent subscriptions (either cascade delete or reassign).

### SMS Ingestion

Inputs:
- Real-time: incoming bank SMS intercepted by a lightweight background listener on the device.
- Backfill: reading existing inbox to detect historical charges (optional).

Outputs:
- `ParsedCharge` objects ready for user confirmation.

Requirements:
- Maintain a dedupe strategy so the same SMS does not create multiple subscriptions.
- Store raw SMS only if strictly needed for debugging, and prefer storing a redacted form with strict retention.

Device bridge (confirmed design):
1. A background listener on-device intercepts incoming SMS.
2. A local regex gate filters for finance/subscription keywords (examples: `debited`, `renewed`, `subscription`, `auto-renewal`, `trial`).
3. If matched, the raw message (plus minimal metadata) is sent to the Node.js/Hono orchestrator.
4. Hono immediately forwards the message to the FastAPI AI service for deep parsing and enrichment.
5. FastAPI returns a structured `ParsedCharge` and a derived `FeatureVector` suitable for classification, optimization, and leak detection.
6. Hono persists canonical records to Postgres and caches realtime views in Redis for instant dashboard/leak-detector updates.

Security and privacy constraints:
- The on-device regex gate must explicitly exclude OTP/promotional messages by default.
- Avoid logging raw SMS at any layer; if stored for debugging, use redaction + short TTL and an audit trail.

### SMS Parsing

The parser must extract:
- Bank name (from sender ID or message)
- Card identifier (last 4 digits typically present as `XX4521` or `....4521`)
- Amount (INR)
- Merchant/service (often uppercase token after `at` or `to`)
- Transaction date/time (if present; otherwise SMS timestamp)

Recommended parsing approach:
- Hybrid extraction (confirmed design):
  - Deterministic regex extracts "hard data": amount, currency, card last-4, and date/time.
  - Cloud NLP performs semantic extraction: merchant identification and intent (subscription signature detection).
- Normalization pass:
  - Normalize whitespace and punctuation.
  - Normalize amount formatting (`INR 649.00`, `Rs. 649`, `₹649`).
  - Normalize merchant names (NETFLIX -> Netflix).
- Confidence scoring:
  - Only auto-open the bottom sheet if confidence is above a threshold.
  - Otherwise, show a softer prompt asking the user to confirm the merchant/amount.

Edge cases to handle:
- Reversed or refunded transactions.
- Non-debit messages (limit updates, OTPs, promotions).
- Multiple amounts in one SMS (available limit plus debit amount).
- Same merchant across different cards.

### Subscription Model

Subscriptions are created from confirmed charges and can also be edited later.

Billing types:
- `recurring`: monthly, quarterly, yearly
- `trial`: a trial end date plus a convert-to-paid amount

Required stored fields:
- `subscriptionId`
- `displayName`
- `merchantKey` (normalized)
- `cardId`
- `amount` (0 allowed for trials)
- `billingType`
- `cycle`
- `nextRenewalAt`
- `status` (`urgent`, `warning`, `safe`, `trial-urgent`)

Status rules (prototype-aligned):
- `urgent`: renewalDays <= 3
- `warning`: 4 <= renewalDays <= 10 (tuneable)
- `safe`: otherwise
- `trial-urgent`: billingType == `trial` and trial end within threshold

Renewal date rules (reference):
- Monthly: add 1 calendar month preserving day-of-month where possible; clamp to end of month if needed.
- Quarterly: add 3 calendar months.
- Yearly: add 1 calendar year.
- If the SMS date is missing, default occurredAt to the SMS received timestamp.

### Alerts

Alert types:
- Renewal alerts (default schedule: 7 days, 3 days, 1 day before renewal)
- Trial conversion warnings (3 days before trial end by prototype)
- Optimization nudges (if a sub-optimal card is used; see advisor)

Requirements:
- Alerts list sorts by `renewalDays` ascending.
- Filters:
  - All
  - Urgent (`urgent` or `trial-urgent`)
  - Trials (`billingType == trial`)

Notification schedule (default):
- Renewal: 7 days before, 3 days before, 1 day before.
- Trial: 3 days before trial end.

### Analytics

Provide:
- Monthly spend total
- Yearly projection (sum monthly * 12, plus notes for trials)
- Spend-by-card (bar chart)
- Spend-by-category (donut with 4 segments in prototype: Entertainment, Productivity, Cloud, Food)
- Top subscriptions list

Notes:
- Categories can start as a static mapping (merchant -> category).
- Trend line in prototype is illustrative; production should compute from historical charges.

### PDF Statement Ingestion (OCR)

Inputs:
- User uploads a PDF statement (or image export) from their bank.

Extraction pipeline:
- OCR + layout extraction (multi-cloud):
  - Google Vision
  - Amazon Textract
  - Amazon Rekognition
- Table normalization: map varying statement formats into a common `StatementTransaction` shape.
- Entity normalization: merchant normalization and de-duplication against existing transactions.

Requirements:
- PDF storage: the PDF remains on the user's device; the backend must not persist the raw PDF file (process ephemerally and discard).
- Clearly label extracted transactions as "from statement" with source metadata and confidence.
- Provide a review UI for ambiguous rows (merchant/amount/date).

### Optimal Card Advisor

Inputs:
- Merchant (or category)
- User's saved cards
- A card benefits database (local seed + updatable rules)

Output:
- Recommended card (max expected value) plus a reason string and estimated savings.

Requirements:
- If the user confirms a charge on a non-optimal card, show a nudge in the confirmation step and on Dashboard.
- Benefits database must be versioned and updatable without an app release if possible.

### Subscription DNA (Personas)

Inputs:
- Subscription portfolio (merchant list + categories + amounts)

Output:
- Persona classification (e.g., Creator, Entertainer, Professional, Student)
- Peer insights cards (initially static or heuristic)
- Evolution timeline (simple inferred timeline is acceptable for MVP)

Requirements:
- Must include the 4 UI components from prototype: particle background, persona card, peer bars, timeline.

### AI Copilot (Phase)

Capability:
- Natural-language queries over the user's own subscriptions and spend data, for example:
  - "What renews this week?"
  - "How much am I spending on entertainment monthly?"
  - "What is my most expensive subscription?"

Implementation guidance:
- Keep this feature optional behind a toggle.
- Prefer on-device summarization for simple queries; use a backend for richer natural language and safety.

## Architecture (Reference)

This section describes the confirmed split-backend architecture and the recommended service boundaries.

### Split-Backend Strategy

- Node.js + Hono: high-speed API orchestration, auth enforcement, request shaping, and frontend-facing endpoints.
- Python + FastAPI: AI/data-science microservice for classification, optimization, and heavy extraction logic.

### Service Responsibilities

Frontend (React + Chart.js):
- Savings Growth Dashboard UI
- Real-time Best Card Suggestion UI
- Subscription Leak Detector UI

API Orchestrator (Node.js + Hono):
- Auth0 integration (JWT validation, RBAC)
- Public API surface for the frontend
- Aggregation layer over Postgres + Redis + Python AI service
- Request throttling, idempotency keys for ingestion

AI/Optimization Service (Python + FastAPI):
- Transaction classifier (Hugging Face + TensorFlow)
- User profile analysis (behavioral modeling, state)
- Rule engine (mini decision tree)
- Reward calculator (NumPy/Pandas)
- Optional: extraction helpers for SMS/PDF when compute-heavy

Storage:
- Postgres: system of record for users, cards, transactions, subscriptions, and audit.
- Redis: cache + online feature store for sub-millisecond reads.
- External datasets (proprietary): credit-card benefits DB, external merchant DB.

### Core Data Flows

Transaction ingestion:
1. User submits SMS text or uploads statement PDF.
2. Hono API validates auth, stores ingestion job, writes idempotency key.
3. Hono calls FastAPI for extraction/classification/enrichment.
4. Hono persists canonicalized transactions in Postgres and feature snapshots in Redis.
5. Frontend queries dashboard/insights endpoints; Hono serves from Redis with Postgres fallback.

Real-time best-card suggestion:
1. Frontend requests recommendation for (merchant, amount, user cards).
2. Hono loads user context/features from Redis.
3. Hono calls FastAPI reward calculator + rule engine.
4. Hono returns recommended card + explanation + estimated savings.

Subscription leak detector (confirmed behavior):
1. FastAPI identifies "subscription signatures" (auto-renewal, trial conversion, recurring cadence signals).
2. FastAPI produces a `FeatureVector` and a leak score (heuristic + model-driven).
3. Hono caches leak signals in Redis for immediate UI surfacing.
4. The UI shows a leak tile/nudge when a redundant/forgotten recurring payment is detected.

## Domain Model (Reference)

This is a stack-agnostic reference schema. Adapt to your database layer.

### Card

```json
{
  "id": "hdfc-4521",
  "bankName": "HDFC Bank",
  "variant": "HDFC INFINIA",
  "lastFour": "4521",
  "expiry": "08/27",
  "network": "Visa",
  "gradientKey": "hdfc"
}
```

### Subscription

```json
{
  "id": "netflix",
  "displayName": "Netflix",
  "merchantKey": "netflix",
  "cardId": "hdfc-4521",
  "amountInr": 649,
  "billingType": "recurring",
  "cycle": "monthly",
  "nextRenewalAt": "2026-04-28",
  "status": "urgent"
}
```

### ParsedCharge (Pre-Confirmation)

```json
{
  "rawMessageRedacted": "HDFC Credit Card XX4521 debited INR 649.00 at NETFLIX",
  "bankName": "HDFC Bank",
  "cardLastFour": "4521",
  "amountInr": 649,
  "merchantRaw": "NETFLIX",
  "merchantKey": "netflix",
  "occurredAt": "2026-03-28T10:15:00+05:30",
  "confidence": 0.92,
  "dedupeKey": "sha256:..."
}
```

## Seed Data (Prototype Alignment)

Prototype seed data is embedded in `README.md` and can be used for:
- UI development without permissions
- Parser test fixtures
- Demo mode

Recommended approach:
- Add a "Demo mode" toggle that loads seed cards + subscriptions into a separate local profile.

## Permissions, Privacy, and Compliance

### Android Permissions

SpendSync is designed around SMS ingestion. A production Android app must be careful with:
- `READ_SMS` and `RECEIVE_SMS` permissions and Play Store policy constraints.

Recommended product fallback if SMS permissions are unavailable:
- Manual add/edit flows for subscriptions
- Optional notification listener approach (policy-sensitive) if viable for your use case

### Data Minimization

- Never store full card numbers, CVV, OTP, or bank login credentials.
- Store the minimum SMS-derived data required to power features.
- Consider encrypting sensitive local fields (even if "only last-4") because the dataset is highly personal.

## Design System Requirements

High-level rules (non-negotiable from prototype):
- Dark-first UI only.
- Cards are pill-shaped everywhere (`rounded-full` concept).
- Headings: Manrope, body: Inter.
- Taps have press feedback (`scale-95` equivalent).

Canonical tokens live in `spendsync-design-system.json`.

## Tech Stack (Confirmed)

Frontend:
- React (Savings Growth Dashboard)
- Chart.js (graphs/metrics)

Backend (Split):
- Node.js runtime
- Hono (API orchestration/router)
- Python
- FastAPI (AI + optimization microservice)

Auth:
- Auth0

Ingestion:
- SMS parser: regex + cloud NLP (optional) to extract transaction details from alerts (and ignore OTPs/promos).
- PDF extractor: Google Vision + Amazon Textract + Amazon Rekognition (multi-cloud OCR and layout extraction).

AI/Optimization:
- Hugging Face (NLP/Transformers)
- TensorFlow (classification + behavioral modeling)
- NumPy + Pandas (reward math, data manipulation)
- Rule engine: mini decision tree filters
- Redis (cache + online feature store)

Datastores:
- PostgreSQL (system of record)
- Redis (cache/feature store)
- External proprietary datasets: credit card DB and merchant DB

## Repository Structure (Recommended)

Recommended monorepo layout:

- `apps/web`: React frontend (Dashboard, Advisor UI, Leak Detector)
- `services/api`: Node.js + Hono orchestrator (frontend-facing API)
- `services/ai`: Python + FastAPI (AI + optimization + heavy extraction)
- `packages/shared`: shared types/schemas (OpenAPI/JSON schema), merchant normalization map interfaces
- `infra`: docker compose, migrations, local tooling

Notes:
- Treat FastAPI as an internal service; do not expose it directly to browsers.
- Hono is the only public API surface; it owns auth, rate limits, and API stability.

## Local Development

### Prerequisites

- Node.js 20+ and `pnpm`
- Python 3.11+ (recommended) and a venv tool (uv/poetry/pip)
- Docker Desktop (for Postgres + Redis)
- Auth0 dev tenant (domain, audience, client id)
- Cloud OCR credentials if testing PDF ingestion locally

### Environment Variables

API Orchestrator (`services/api`):
- `NODE_ENV=development`
- `PORT=3001`
- `DATABASE_URL=postgresql://...`
- `REDIS_URL=redis://...`
- `AUTH0_DOMAIN=...`
- `AUTH0_AUDIENCE=...`
- `AUTH0_ISSUER_BASE_URL=...`
- `AUTH0_CLIENT_ID=...` (only if doing server-side OAuth flows)
- `AI_SERVICE_URL=http://localhost:8000`
- `INGESTION_IDEMPOTENCY_TTL_SECONDS=86400`

AI Service (`services/ai`):
- `PYTHON_ENV=development`
- `PORT=8000`
- `REDIS_URL=redis://...` (optional; can be mediated by Hono if preferred)
- `HF_TOKEN=...` (if required)
- `MODEL_VERSION=...`
- `GOOGLE_APPLICATION_CREDENTIALS=...` (if using Google Vision locally)
- `AWS_ACCESS_KEY_ID=...`
- `AWS_SECRET_ACCESS_KEY=...`
- `AWS_REGION=...`

Web (`apps/web`):
- `VITE_API_BASE_URL=http://localhost:3001`
- `VITE_AUTH0_DOMAIN=...`
- `VITE_AUTH0_CLIENT_ID=...`
- `VITE_AUTH0_AUDIENCE=...`

### Run (Reference Commands)

These are reference commands; adjust to your package manager and scripts.

1. Start Postgres + Redis
   - `docker compose up -d postgres redis`
2. Start AI service
   - `cd services/ai`
   - `uv run uvicorn app.main:app --reload --port 8000`
3. Start API orchestrator
   - `cd services/api`
   - `pnpm dev`
4. Start web app
   - `cd apps/web`
   - `pnpm dev`

## API Contracts (Draft)

All public endpoints are served by Hono. FastAPI endpoints are internal.

### Public (Hono) Endpoints

Auth:
- `GET /health`
- `GET /me`

Ingestion:
- `POST /ingest/sms`
  - purpose: device bridge endpoint (called by the mobile background listener)
  - headers: `Authorization: Bearer <auth0_access_token>`, `Idempotency-Key: <string>`
  - body: `{ message: string, sender?: string, receivedAt?: string, deviceTime?: string, simSlot?: number, source?: 'sms' }`
  - returns: `{ ingestionId, parsedCharges: ParsedCharge[] }`
- `POST /ingest/statement`
  - multipart: pdf upload
  - returns: `{ ingestionId, extractedTransactions: ExtractedTransaction[] }`

Core data:
- `GET /transactions?from=...&to=...`
- `GET /subscriptions`
- `POST /subscriptions` (create/update from confirmed charge)

Insights:
- `GET /insights/dashboard`
- `GET /insights/analytics`
- `GET /recommendations/best-card?merchant=...&amountInr=...`

### Internal (FastAPI) Endpoints

- `POST /ai/parse/sms`
- `POST /ai/extract/statement`
- `POST /ai/classify/transaction`
- `POST /ai/profile/update`
- `POST /ai/rewards/recommend`
- `POST /ai/features/build` (FeatureVector generation)

Contract requirements:
- All ingestion endpoints accept an idempotency key header (recommended) to prevent duplicates.
- All internal calls from Hono to FastAPI include a service token or mTLS in non-dev environments.

## Database Schema (Draft)

Postgres tables (suggested):
- `users`
- `cards`
- `transactions`
- `merchant_normalizations`
- `subscriptions`
- `alerts`
- `ingestion_jobs`
- `ingestion_events` (optional audit)
- `reward_rules_versions` (if benefits DB is versioned)

Key constraints:
- `transactions` has a unique constraint on a dedupe key (hash of normalized source fields).
- `subscriptions` are unique per `(userId, merchantKey, cardId, cycle)` unless explicitly allowed.
- `ingestion_jobs` store source type, status, and a checksum/idempotency key.

## Caching and Feature Store

Redis responsibilities:
- Cache dashboard aggregates: monthly total, yearly projection, top subscriptions, spend-by-card.
- Store online features for AI:
  - user spend embeddings or summarized feature vectors
  - last N transactions features
  - merchant-level frequency stats
- Cache best-card recommendations for (userId, merchantKey, amountBucket) with short TTL.
- Cache leak detector signals (userId + merchantKey) with TTL and a "last seen" timestamp.

Guidance:
- Redis values must be derivable from Postgres; cache should be safe to evict.
- Prefer versioned keys: `feat:{userId}:v{MODEL_VERSION}` to avoid mixing model versions.

## AI and Optimization

### Transaction Classifier

Goal:
- Map extracted transactions into categories and detect subscription-likeness.

Implementation notes:
- Combine deterministic rules (merchant map) with ML classification for long-tail merchants.
- Persist both the predicted label and the confidence score.
- Provide an override path in UI to correct category; store corrections for future training.

### User Profile Analysis

Goal:
- Maintain a user-level state used by recommendations and persona classification.

Implementation notes:
- Store "ground truth" profile snapshots in Postgres; store fast features in Redis.
- Keep inference deterministic and reproducible for a given model version.

### Rule Engine + Reward Calculator

Goal:
- Recommend the best card for a purchase with an explanation and estimated savings.

Implementation notes:
- Use a rule-filter stage (eligibility) then a scoring stage (expected value).
- Always return:
  - recommended card id
  - rationale string(s)
  - estimated reward (cashback/points) and conversion assumption
  - confidence and data freshness (benefits DB version)

### Feature Vector (From SMS/PDF)

FastAPI should produce a normalized `FeatureVector` JSON per transaction to support:
- classification
- subscription signature detection
- leak detection
- reward optimization

Reference shape (draft):
```json
{
  "merchantKey": "netflix",
  "merchantCategory": "entertainment",
  "amountInr": 649,
  "currency": "INR",
  "cardLastFour": "4521",
  "isSubscriptionLikely": true,
  "subscriptionSignals": ["auto-renewal"],
  "frequency30d": 1,
  "avgAmount90d": 649,
  "source": "sms",
  "confidence": 0.92
}
```

This vector is evaluated against proprietary datasets and reward rules via the mini decision-tree rule engine to determine:
- best card suggestion (max reward)
- "sub-optimal card used" nudge
- leak score (forgotten/redundant recurring payment risk)

## Deployment (Reference)

Environments:
- Dev: local Docker for Postgres/Redis; stub OCR if needed.
- Staging: full stack with Auth0 staging tenant and sandbox OCR credentials.
- Production: Hono API behind a gateway/CDN; FastAPI behind private networking; Postgres with backups; Redis with persistence optional.

Security baseline:
- Auth0 JWT validation at Hono for all user routes.
- Service-to-service auth between Hono and FastAPI.
- Encrypt secrets; never log raw SMS/PDF content.
- PII redaction in logs and traces.

## Testing Strategy

- Parser unit tests: bank SMS fixtures -> parsed fields + confidence thresholds.
- Dedupe tests: repeated SMS should not create duplicate subscriptions.
- Scheduler tests: ensure notifications are scheduled at 7/3/1 days for various timezones.
- Advisor tests: merchant/category + benefits DB -> correct recommended card.

## Milestones

- M1: Cards + manual subscriptions + Alerts list sorting/filtering
- M2: SMS parsing + bottom sheet confirmation flow + renewal scheduling
- M3: Analytics (spend-by-card + category + top subscriptions)
- M4: Optimal Card Advisor (benefits DB + nudges)
- M5: Subscription DNA
- M6: AI Copilot

## Open Questions (Need Confirmation)

- Cloud NLP provider and security constraints (defer until implementation).
- Reward currencies and conversion rates support (defer until implementation).
- Dev access strategy for proprietary datasets (defer until implementation).
