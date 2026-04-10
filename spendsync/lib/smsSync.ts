// ── FILE: lib/smsSync.ts ──────────────────────────────────────────────────────
// Platform-aware SMS sync. Uses MockSMSService on emulator (__DEV__ or non-Android).

import { Platform } from 'react-native';
import { parseSMS, type ParsedTransaction } from './smsParser';

export interface ParsedSMS {
  id: string;
  raw: string;
  merchant: string;
  amount: number;
  cardLastFour: string;
  cardId: string;
  bank: string;
  date: string;
}

export interface SyncResult {
  fetched: number;
  parsed: number;
  duplicates: number;
  newTransactions: ParsedTransaction[];
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_SMS_QUEUE: ParsedSMS[] = [
  {
    id: 'sms1',
    raw: 'Your HDFC Bank Credit Card XX4521 has been debited for INR 649.00 at NETFLIX on 28-Mar-2026. Available limit: INR 2,50,000.00',
    merchant: 'Netflix',
    amount: 649,
    cardLastFour: '4521',
    cardId: 'hdfc',
    bank: 'HDFC Bank',
    date: '28-Mar-2026',
  },
  {
    id: 'sms2',
    raw: 'Your ICICI Bank Credit Card XX8834 has been debited for INR 299.00 at HOTSTAR on 28-Mar-2026. Available Credit Limit: INR 1,85,000',
    merchant: 'Disney+ Hotstar',
    amount: 299,
    cardLastFour: '8834',
    cardId: 'icici',
    bank: 'ICICI Bank',
    date: '28-Mar-2026',
  },
  {
    id: 'sms3',
    raw: 'Your SBI Credit Card XX2210 has been debited for INR 499.00 at CANVA on 28-Mar-2026. Available credit: INR 3,10,000',
    merchant: 'Canva Pro',
    amount: 499,
    cardLastFour: '2210',
    cardId: 'sbi',
    bank: 'State Bank of India',
    date: '28-Mar-2026',
  },
];

const BANK_SENDERS = [
  'HDFCBK', 'HDFCCC', 'ICICIB', 'ICICICC',
  'SBIINB', 'SBICRD', 'AXISBK', 'AXISCC',
  'KOTAKB', 'KOTAKC', 'YESBNK', 'INDBNK',
];

// ── MOCK SMS SERVICE ──────────────────────────────────────────────────────────
class MockSMSService {
  private static queue: ParsedSMS[] = [...MOCK_SMS_QUEUE];
  private static index = 0;

  static getNext(): ParsedSMS | null {
    if (MockSMSService.index >= MockSMSService.queue.length) {
      // Cycle back from start
      MockSMSService.index = 0;
    }
    const item = MockSMSService.queue[MockSMSService.index] ?? null;
    MockSMSService.index++;
    return item;
  }

  static reset(): void {
    MockSMSService.index = 0;
    MockSMSService.queue = [...MOCK_SMS_QUEUE];
  }

  static peekNext(): ParsedSMS | null {
    return MockSMSService.queue[MockSMSService.index] ?? null;
  }
}

export { MockSMSService, MOCK_SMS_QUEUE };

// ── PERMISSION REQUEST ────────────────────────────────────────────────────────
export async function requestSMSPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || __DEV__) {
    // Mock always available on emulator / iOS
    return true;
  }
  try {
    // Dynamic import to avoid crashes on non-Android
    const { PermissionsAndroid } = await import('react-native');
    const result = await PermissionsAndroid.request(
      'android.permission.READ_SMS' as Parameters<typeof PermissionsAndroid.request>[0],
      {
        title: 'SpendSync SMS Permission',
        message: 'SpendSync needs access to your SMS to automatically detect subscription charges.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    return result === 'granted';
  } catch {
    return false;
  }
}

// ── MAIN SYNC FUNCTION ────────────────────────────────────────────────────────
export async function syncSMSInbox(
  lastSyncTimestamp: number,
  isProcessed: (id: string) => boolean
): Promise<SyncResult> {
  const result: SyncResult = {
    fetched: 0,
    parsed: 0,
    duplicates: 0,
    newTransactions: [],
  };

  // Emulator / Dev mode: use mock
  if (__DEV__ || Platform.OS !== 'android') {
    const mock = MockSMSService.getNext();
    if (!mock) return result;

    result.fetched = 1;

    if (isProcessed(mock.id)) {
      result.duplicates = 1;
      return result;
    }

    const parsed = parseSMS(mock.raw, new Date());
    if (parsed) {
      result.parsed = 1;
      result.newTransactions = [parsed];
    }
    return result;
  }

  // Real Android device — dynamic import
  try {
    const SmsAndroid = (await import('react-native-get-sms-android')).default;
    return new Promise((resolve) => {
      SmsAndroid.list(
        JSON.stringify({
          box: 'inbox',
          minDate: lastSyncTimestamp,
          indexFrom: 0,
          maxCount: 50,
        }),
        (fail: string) => {
          console.warn('SMS list failed:', fail);
          resolve(result);
        },
        (_count: number, smsList: string) => {
          const messages: Array<{ _id: string; address: string; body: string; date: number }> =
            JSON.parse(smsList);

          // Filter by known bank senders
          const bankMessages = messages.filter(m =>
            BANK_SENDERS.some(s => m.address?.toUpperCase().includes(s))
          );

          result.fetched = bankMessages.length;

          for (const msg of bankMessages) {
            if (isProcessed(String(msg._id))) {
              result.duplicates++;
              continue;
            }
            const parsed = parseSMS(msg.body, new Date(msg.date));
            if (parsed) {
              result.parsed++;
              result.newTransactions.push(parsed);
            }
          }
          resolve(result);
        }
      );
    });
  } catch {
    return result;
  }
}

// ── SIMULATE INCOMING SMS (UI button) ─────────────────────────────────────────
export function simulateIncomingSMS(): ParsedSMS | null {
  return MockSMSService.getNext();
}
