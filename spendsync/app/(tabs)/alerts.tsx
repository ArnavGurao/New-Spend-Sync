// ── FILE: app/(tabs)/alerts.tsx ───────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { SubscriptionRow } from '../../components/subscriptions/SubscriptionRow';
import { fmt } from '../../lib/formatters';
import { COLORS } from '../../constants/theme';
import { deleteSubscriptionById } from '../../db/client';

type FilterKey = 'all' | 'urgent' | 'trials';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'trials', label: 'Trials' },
];

export default function AlertsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { subscriptions, isLoading, removeSubscription, showToast, alertFilter, setAlertFilter } = useStore();

  const filtered = useMemo(() => {
    let list = [...subscriptions];
    if (alertFilter === 'urgent') {
      list = list.filter((s) => s.status === 'urgent' || s.status === 'trial-urgent');
    } else if (alertFilter === 'trials') {
      list = list.filter((s) => s.billingType === 'trial');
    }
    return list.sort((a, b) => a.renewalDays - b.renewalDays);
  }, [subscriptions, alertFilter]);

  const handleCancel = async (id: string) => {
    try {
      await deleteSubscriptionById(id);
      removeSubscription(id);
      showToast('Subscription cancelled', 'info');
    } catch {
      showToast('Failed to cancel. Try again.', 'error');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  const urgentSubs = subscriptions.filter((s) => s.status === 'urgent' || s.status === 'trial-urgent');
  const totalRenewal = urgentSubs.reduce((s, sub) => s + sub.amount, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Alerts</Text>

        {/* Intelligence banner */}
        {urgentSubs.length > 0 && (
          <View style={styles.intelligenceBanner}>
            <Text style={styles.intelligenceIcon}>🧠</Text>
            <View style={styles.intelligenceContent}>
              <Text style={styles.intelligenceTitle}>SpendSync Intelligence</Text>
              <Text style={styles.intelligenceSub}>
                {urgentSubs.length} subscription{urgentSubs.length > 1 ? 's' : ''} renewing soon.
                {' '}{fmt(totalRenewal)} total due within 7 days.
              </Text>
            </View>
          </View>
        )}

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filterTab, alertFilter === f.key && styles.filterTabActive]}
              onPress={() => setAlertFilter(f.key)}
            >
              <Text style={[styles.filterText, alertFilter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Subscription list */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptySub}>No alerts matching this filter</Text>
          </View>
        ) : (
          filtered.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              subscription={sub}
              onCancel={handleCancel}
              showCard={true}
            />
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  content: { paddingHorizontal: 0, gap: 12, paddingTop: 16 },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#e7e5e4', fontSize: 28, fontWeight: '700', letterSpacing: -0.5, paddingHorizontal: 24 },

  intelligenceBanner: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: 'rgba(198,198,199,0.06)',
    borderWidth: 1, borderColor: 'rgba(198,198,199,0.12)',
    borderRadius: 16, padding: 16, marginHorizontal: 16,
  },
  intelligenceIcon: { fontSize: 22 },
  intelligenceContent: { flex: 1, gap: 2 },
  intelligenceTitle: { color: '#e7e5e4', fontSize: 14, fontWeight: '700' },
  intelligenceSub: { color: '#acabaa', fontSize: 12, lineHeight: 17 },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  filterTab: {
    flex: 1, paddingVertical: 9, borderRadius: 12,
    backgroundColor: '#131313', alignItems: 'center',
    borderWidth: 1, borderColor: '#252626',
  },
  filterTabActive: { backgroundColor: '#454747', borderColor: '#767575' },
  filterText: { color: '#767575', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#e7e5e4' },

  emptyState: {
    alignItems: 'center', gap: 8, paddingVertical: 60,
    marginHorizontal: 16,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: '#e7e5e4', fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#acabaa', fontSize: 13 },
});
