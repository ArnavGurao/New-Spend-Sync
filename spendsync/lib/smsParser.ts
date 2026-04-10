// ── FILE: lib/smsParser.ts ────────────────────────────────────────────────────
// Pure TypeScript. Zero React Native imports. 100% unit-testable.

import { categorize, type Category } from './categorizer';

export interface ParsedTransaction {
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  cardLastFour: string;
  bank: string;
  date: Date;
  category: Category;
  rawSMS: string;
  confidence: 'high' | 'medium' | 'low';
}

// ── FILTER KEYWORDS (return null immediately if found) ────────────────────────
const REJECT_PATTERNS: RegExp[] = [
  /\botp\b/i,
  /one[\s-]?time[\s-]?password/i,
  /\bpassword\b/i,
  /low balance/i,
  /minimum balance/i,
  /reward point/i,
  /cashback credited to your reward/i,
  /payment due/i,
  /bill generated/i,
  /\bstatement\b/i,
  /\boffer\b/i,
  /\bdiscount\b/i,
  /\d+%\s*off/i,
  /\bdeal\b/i,
];

// ── BANK PARSERS ──────────────────────────────────────────────────────────────
interface BankMatch {
  bank: string;
  last4?: string;
  amount?: number;
  merchant?: string;
  date?: string;
  type: 'debit' | 'credit';
  confidence: 'high' | 'medium' | 'low';
}

function parseHDFC(sms: string): BankMatch | null {
  // "Your HDFC Bank Credit Card XX4521 has been debited for INR 649.00 at NETFLIX on 28-Mar-2026"
  const debitRx = /Your HDFC Bank (?:Credit|Debit) Card XX(\d{4})\s+has been debited for\s+(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s+at\s+([A-Z0-9 &.'/-]+?)\s+on\s+([\d\w-]+)/i;
  const creditRx = /Your HDFC Bank (?:Credit|Debit) Card XX(\d{4})\s+(?:has been credited|credited|received|refund)/i;

  let m = sms.match(debitRx);
  if (m) {
    return {
      bank: 'HDFC Bank',
      last4: m[1],
      amount: parseAmount(m[2]),
      merchant: normalizeMerchant(m[3]),
      date: m[4],
      type: 'debit',
      confidence: 'high',
    };
  }
  m = sms.match(creditRx);
  if (m) {
    return { bank: 'HDFC Bank', last4: m[1], type: 'credit', confidence: 'high' };
  }
  if (/HDFC/i.test(sms)) {
    return tryGeneric(sms, 'HDFC Bank');
  }
  return null;
}

function parseICICI(sms: string): BankMatch | null {
  // "Your ICICI Bank Credit Card XX8834 has been debited for INR 299.00 at HOTSTAR on 28-Mar-2026"
  const debitRx = /Your ICICI Bank (?:Credit|Debit) Card XX(\d{4})\s+has been debited for\s+(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s+at\s+([A-Z0-9 &.'/-]+?)\s+on\s+([\d\w-]+)/i;
  const altRx    = /ICICI Bank[^:]*:.*?(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s+(?:debited|spent)\s+at\s+([A-Z0-9 &.'/-]+)/i;

  let m = sms.match(debitRx);
  if (m) {
    return {
      bank: 'ICICI Bank',
      last4: m[1],
      amount: parseAmount(m[2]),
      merchant: normalizeMerchant(m[3]),
      date: m[4],
      type: 'debit',
      confidence: 'high',
    };
  }
  const isCredit = /credited|received|refund/i.test(sms);
  m = sms.match(altRx);
  if (m) {
    return {
      bank: 'ICICI Bank',
      amount: parseAmount(m[1]),
      merchant: normalizeMerchant(m[2]),
      type: isCredit ? 'credit' : 'debit',
      confidence: 'medium',
    };
  }
  if (/ICICI/i.test(sms)) {
    return tryGeneric(sms, 'ICICI Bank');
  }
  return null;
}

function parseSBI(sms: string): BankMatch | null {
  // "Your SBI Credit Card XX2210 has been debited for INR 499.00 at CANVA on 28-Mar-2026"
  const debitRx = /Your SBI (?:Credit|Debit) Card XX(\d{4})\s+has been debited for\s+(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s+at\s+([A-Z0-9 &.'/-]+?)\s+on\s+([\d\w-]+)/i;

  const m = sms.match(debitRx);
  if (m) {
    return {
      bank: 'State Bank of India',
      last4: m[1],
      amount: parseAmount(m[2]),
      merchant: normalizeMerchant(m[3]),
      date: m[4],
      type: 'debit',
      confidence: 'high',
    };
  }
  if (/\bSBI\b/i.test(sms)) {
    return tryGeneric(sms, 'State Bank of India');
  }
  return null;
}

function parseAxis(sms: string): BankMatch | null {
  // "Axis Bank Credit Card ending 6603... debited by Rs.1384 at MERCHANT"
  const debitRx = /Axis Bank (?:Credit|Debit) Card ending (\d{4})[^\d]+debited by\s+Rs\.?\s*([\d,]+(?:\.\d{2})?)\s+at\s+([A-Z0-9 &.'/-]+)/i;

  const m = sms.match(debitRx);
  if (m) {
    return {
      bank: 'Axis Bank',
      last4: m[1],
      amount: parseAmount(m[2]),
      merchant: normalizeMerchant(m[3]),
      type: 'debit',
      confidence: 'high',
    };
  }
  if (/Axis Bank/i.test(sms)) {
    return tryGeneric(sms, 'Axis Bank');
  }
  return null;
}

function parseKotak(sms: string): BankMatch | null {
  // "Kotak Credit Card XX1234 used for Rs 499 at MERCHANT"
  const debitRx = /Kotak (?:Credit|Debit) Card XX(\d{4})\s+used for\s+Rs\.?\s*([\d,]+(?:\.\d{2})?)\s+at\s+([A-Z0-9 &.'/-]+)/i;

  const m = sms.match(debitRx);
  if (m) {
    return {
      bank: 'Kotak Mahindra Bank',
      last4: m[1],
      amount: parseAmount(m[2]),
      merchant: normalizeMerchant(m[3]),
      type: 'debit',
      confidence: 'high',
    };
  }
  if (/Kotak/i.test(sms)) {
    return tryGeneric(sms, 'Kotak Mahindra Bank');
  }
  return null;
}

function tryGeneric(sms: string, bank: string): BankMatch | null {
  // UPI catch-all pattern
  const amountRx   = /(?:debited|deducted|spent|used for|for INR|for Rs\.?|for ₹)\s*(?:INR|Rs\.?|₹)?\s*([\d,]+(?:\.\d{2})?)/i;
  const last4Rx    = /XX(\d{4})|ending\s+(\d{4})|Card\s+(\d{4})/i;
  const merchantRx = /at\s+([A-Z0-9 &.'/-]{2,30}?)(?:\s+on|\s*$|\s+dated)/i;
  const isCredit   = /credited|received|refund/i.test(sms);

  const amtM  = sms.match(amountRx);
  const last4M = sms.match(last4Rx);
  const merM  = sms.match(merchantRx);

  if (!amtM) return null;

  return {
    bank,
    amount: parseAmount(amtM[1]),
    last4: last4M ? (last4M[1] ?? last4M[2] ?? last4M[3]) : undefined,
    merchant: merM ? normalizeMerchant(merM[1]) : 'Unknown',
    type: isCredit ? 'credit' : 'debit',
    confidence: 'low',
  };
}

// ── AMOUNT PARSER ─────────────────────────────────────────────────────────────
function parseAmount(raw: string): number {
  // Strip commas (handles Indian lakh system like 1,20,000.00)
  const cleaned = raw.replace(/,/g, '').trim();
  return parseFloat(cleaned);
}

// ── MERCHANT NORMALIZER ───────────────────────────────────────────────────────
function normalizeMerchant(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    // Title-case
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// ── DATE PARSER ───────────────────────────────────────────────────────────────
function parseDate(dateStr: string | undefined, fallback: Date): Date {
  if (!dateStr) return fallback;
  // Formats: "28-Mar-2026", "28/03/2026", "28-03-2026"
  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const named = dateStr.match(/(\d{1,2})[-/]([A-Za-z]+)[-/](\d{4})/);
  if (named) {
    const mon = monthMap[named[2].toLowerCase()];
    if (mon !== undefined) {
      return new Date(parseInt(named[3]), mon, parseInt(named[1]));
    }
  }
  const numeric = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (numeric) {
    return new Date(parseInt(numeric[3]), parseInt(numeric[2]) - 1, parseInt(numeric[1]));
  }
  return fallback;
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
const BANK_PARSERS = [parseHDFC, parseICICI, parseSBI, parseAxis, parseKotak];

export function parseSMS(raw: string, receivedAt: Date): ParsedTransaction | null {
  // 1. Reject filter
  for (const pattern of REJECT_PATTERNS) {
    if (pattern.test(raw)) return null;
  }

  // 2. Try each bank parser
  let match: BankMatch | null = null;
  for (const parser of BANK_PARSERS) {
    match = parser(raw);
    if (match) break;
  }

  // 3. If no bank matched, try generic UPI
  if (!match) {
    const genericAmountRx = /(?:debited|deducted).*?(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)/i;
    const m = raw.match(genericAmountRx);
    if (!m) return null;
    match = {
      bank: 'Unknown',
      amount: parseAmount(m[1]),
      type: /credited|received|refund/i.test(raw) ? 'credit' : 'debit',
      confidence: 'low',
    };
  }

  // 4. Amount must exist
  if (!match.amount || isNaN(match.amount)) return null;

  const merchant = match.merchant ?? 'Unknown';
  return {
    merchant,
    amount: match.amount,
    type: match.type,
    cardLastFour: match.last4 ?? '0000',
    bank: match.bank,
    date: parseDate(match.date, receivedAt),
    category: categorize(merchant),
    rawSMS: raw,
    confidence: match.confidence,
  };
}
