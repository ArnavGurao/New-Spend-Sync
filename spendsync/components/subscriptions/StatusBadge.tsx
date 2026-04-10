// ── FILE: components/subscriptions/StatusBadge.tsx ───────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SubscriptionStatus } from '../../store/useStore';
import { COLORS } from '../../constants/theme';

interface StatusBadgeProps {
  status: SubscriptionStatus;
  renewalDays: number;
}

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  urgent:       { label: 'URGENT',    bg: 'rgba(238,125,119,0.12)', text: COLORS.error,    border: COLORS.error    },
  warning:      { label: 'DUE SOON',  bg: 'rgba(255,191,0,0.12)',   text: COLORS.secondary, border: COLORS.secondary },
  'trial-urgent': { label: 'TRIAL',   bg: 'rgba(198,198,199,0.12)', text: COLORS.primary,  border: COLORS.primary  },
  safe:         { label: 'SAFE',      bg: 'rgba(0,201,167,0.10)',   text: COLORS.brandTeal, border: COLORS.brandTeal },
};

export function StatusBadge({ status, renewalDays }: StatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.label, { color: config.text }]}>
        {config.label}
      </Text>
      <Text style={[styles.days, { color: config.text }]}>
        {renewalDays}d
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  days: {
    fontSize: 11,
    fontWeight: '700',
  },
});
