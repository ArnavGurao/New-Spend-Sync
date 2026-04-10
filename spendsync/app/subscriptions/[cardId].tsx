import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { HeroCard } from '../../components/cards/HeroCard';
import { SubscriptionRow } from '../../components/subscriptions/SubscriptionRow';
import { fmt } from '../../lib/formatters';
import { COLORS } from '../../constants/theme';
import { deleteSubscriptionById } from '../../db/client';

export default function CardDetailScreen(): React.JSX.Element {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards, subscriptions, isLoading, removeSubscription, showToast } = useStore();

  const card = useMemo(() => cards.find((item) => item.id === cardId), [cards, cardId]);
  const cardSubs = useMemo(
    () => subscriptions.filter((item) => item.cardId === cardId),
    [subscriptions, cardId]
  );

  const totalMonthly = useMemo(() => {
    return cardSubs.reduce((sum, item) => {
      if (item.cycle === 'monthly') return sum + item.amount;
      if (item.cycle === 'quarterly') return sum + item.amount / 3;
      if (item.cycle === 'yearly') return sum + item.amount / 12;
      return sum + item.amount;
    }, 0);
  }, [cardSubs]);

  const yearlyProjected = totalMonthly * 12;
  const storedAmount = card?.monthlySpend ?? 0;
  const estimatedPoints = Math.floor((Math.max(totalMonthly, storedAmount) || 0) / 50);
  const nextRenewal = [...cardSubs].sort((left, right) => left.renewalDays - right.renewalDays)[0];

  const handleCancel = async (id: string) => {
    try {
      await deleteSubscriptionById(id);
      removeSubscription(id);
      showToast('Subscription cancelled', 'info');
    } catch {
      showToast('Failed to cancel. Try again.', 'error');
    }
  };

  if (isLoading || !card) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{card.variant}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroCard card={card} subscriptions={subscriptions} />

        <View style={styles.metricsGrid}>
          <MetricCard label="Stored Amount" value={fmt(Math.round(storedAmount))} accent={COLORS.secondary} />
          <MetricCard label="Subscriptions" value={`${cardSubs.length}`} accent={COLORS.onSurface} />
          <MetricCard label="Points Est." value={`${estimatedPoints}`} accent={COLORS.brandTeal} />
          <MetricCard label="Yearly Outflow" value={fmt(Math.round(yearlyProjected))} accent={COLORS.primary} />
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Card Details</Text>
          <View style={styles.detailList}>
            <DetailRow label="Bank" value={card.bank} />
            <DetailRow label="Variant" value={card.variant} />
            <DetailRow label="Network" value={card.network} />
            <DetailRow label="Last 4" value={card.last4} />
            <DetailRow label="Expiry" value={card.expiry} />
            <DetailRow
              label="Next Renewal"
              value={nextRenewal ? `${nextRenewal.name} in ${nextRenewal.renewalDays} days` : 'No upcoming renewals'}
            />
          </View>
        </View>

        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Recurring Monthly</Text>
            <Text style={styles.summaryValue}>{fmt(Math.round(totalMonthly))}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active Services</Text>
            <Text style={styles.summaryValue}>{cardSubs.length}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Reward Snapshot</Text>
            <Text style={[styles.summaryValue, { color: COLORS.brandTeal }]}>{estimatedPoints} pts</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Linked Subscriptions</Text>
        {cardSubs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>SS</Text>
            <Text style={styles.emptyTitle}>No subscriptions</Text>
            <Text style={styles.emptySub}>
              Use Simulate SMS on the dashboard to add one.
            </Text>
          </View>
        ) : (
          cardSubs.map((item) => (
            <SubscriptionRow
              key={item.id}
              subscription={item}
              onCancel={handleCancel}
              showCard={true}
              cardVariant={card.variant}
            />
          ))
        )}

        <View style={styles.autoPay}>
          <Text style={styles.autoPayText}>
            Auto-pay is enabled for this card and rewards are estimated from the current recurring spend.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}): React.JSX.Element {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252626',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#e7e5e4', fontSize: 28, lineHeight: 32 },
  headerTitle: { color: '#e7e5e4', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  content: { paddingHorizontal: 0, gap: 18, paddingTop: 8 },

  metricsGrid: {
    marginHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    minWidth: '47%',
    flexGrow: 1,
    backgroundColor: '#131313',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#252626',
  },
  metricLabel: {
    color: '#767575',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  detailCard: {
    marginHorizontal: 24,
    backgroundColor: '#131313',
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#252626',
  },
  detailTitle: {
    color: '#e7e5e4',
    fontSize: 16,
    fontWeight: '700',
  },
  detailList: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    color: '#767575',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValue: {
    color: '#e7e5e4',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },

  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#131313',
    borderRadius: 16,
    marginHorizontal: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252626',
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryLabel: { color: '#767575', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' },
  summaryValue: { color: '#e7e5e4', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  divider: { width: 1, backgroundColor: '#252626' },

  sectionTitle: {
    color: '#acabaa',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 40,
    marginHorizontal: 24,
    backgroundColor: '#131313',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#252626',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 48,
  },
  emptyTitle: { color: '#e7e5e4', fontSize: 16, fontWeight: '700' },
  emptySub: { color: '#acabaa', fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },

  autoPay: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(0,201,167,0.08)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,201,167,0.2)',
  },
  autoPayText: { color: COLORS.brandTeal, fontSize: 13, fontWeight: '500', textAlign: 'center' },
});
