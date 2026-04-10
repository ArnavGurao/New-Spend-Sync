// ── FILE: components/sms/SMSBottomSheet.tsx ──────────────────────────────────
// Orchestrates the SMS detection bottom sheet — wraps BottomSheet + SMSStepFlow.
// Handles subscription creation and DB write on completion.

import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BottomSheet } from '../ui/BottomSheet';
import { SMSStepFlow } from './SMSStepFlow';
import { useStore } from '../../store/useStore';
import { db } from '../../db/client';
import * as schema from '../../db/schema';
import { categorize } from '../../lib/categorizer';
import type { ParsedSMS } from '../../lib/smsSync';
import type { Subscription } from '../../store/useStore';

interface SMSBottomSheetProps {
  visible: boolean;
  sms: ParsedSMS | null;
  onClose: () => void;
}

export function SMSBottomSheet({ visible, sms, onClose }: SMSBottomSheetProps): React.JSX.Element | null {
  const router = useRouter();
  const { smsFlow, resetSMSFlow, addSubscription, showToast } = useStore();

  const handleComplete = useCallback(async () => {
    if (!sms) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Build subscription object from flow state
      const newSub: Subscription = {
        id: `sub_${Date.now()}`,
        name: sms.merchant,
        cardId: sms.cardId,
        amount: sms.amount,
        billingType: smsFlow.billingType ?? 'recurring',
        cycle: smsFlow.billingType === 'trial' ? null : (smsFlow.cycle ?? 'monthly'),
        renewalDays: smsFlow.billingType === 'trial' ? 3 : 30,
        trialEndsAmount: smsFlow.billingType === 'trial' ? sms.amount : undefined,
        category: categorize(sms.merchant),
        icon: getCategoryIcon(categorize(sms.merchant)),
        status: smsFlow.billingType === 'trial' ? 'trial-urgent' : 'safe',
      };

      // Write to SQLite
      await db.insert(schema.subscriptions).values({
        id:              newSub.id,
        name:            newSub.name,
        cardId:          newSub.cardId,
        amount:          newSub.amount,
        billingType:     newSub.billingType,
        cycle:           newSub.cycle ?? null,
        renewalDays:     newSub.renewalDays,
        trialEndsAmount: newSub.trialEndsAmount ?? null,
        category:        newSub.category,
        icon:            newSub.icon,
        status:          newSub.status,
        createdAt:       Date.now(),
      });

      // Mark SMS as processed
      await db.insert(schema.processedSMS).values({
        id:          sms.id,
        processedAt: Date.now(),
      });

      // Optimistic update to Zustand
      addSubscription(newSub);

      // Close sheet
      resetSMSFlow();
      onClose();

      // Toast + navigate home after short delay
      setTimeout(() => {
        showToast(`✓ ${newSub.name} is now being tracked!`, 'success');
        router.replace('/');
      }, 500);
    } catch (err) {
      showToast('Failed to save subscription. Please try again.', 'error');
    }
  }, [sms, smsFlow, addSubscription, showToast, resetSMSFlow, onClose, router]);

  if (!sms) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <SMSStepFlow sms={sms} onComplete={handleComplete} />
    </BottomSheet>
  );
}

function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    Entertainment: 'movie',
    Food: 'restaurant',
    Shopping: 'shopping_bag',
    Travel: 'flight',
    Productivity: 'work',
    Cloud: 'cloud',
    Professional: 'work',
    Other: 'receipt',
  };
  return map[category] ?? 'receipt';
}
