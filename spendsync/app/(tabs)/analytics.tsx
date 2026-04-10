import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useStore } from '../../store/useStore';
import { SpendRing, type SpendSegment } from '../../components/ui/SpendRing';
import { fmt } from '../../lib/formatters';
import { COLORS } from '../../constants/theme';
import type { Subscription } from '../../store/useStore';

const ANALYTICS_CATEGORIES = [
  'Entertainment',
  'Food',
  'Shopping',
  'Travel',
  'Productivity',
  'Cloud',
  'Professional',
  'Finance',
  'Health',
  'Education',
  'Gaming',
  'Utilities',
  'Other',
] as const;

type AnalyticsCategory = typeof ANALYTICS_CATEGORIES[number];

const CATEGORY_COLORS: Record<AnalyticsCategory, string> = {
  Entertainment: COLORS.chart1,
  Food: COLORS.chart2,
  Shopping: COLORS.chart3,
  Travel: '#7C5CFC',
  Productivity: COLORS.chart4,
  Cloud: COLORS.chart5,
  Professional: '#00BCD4',
  Finance: '#26A69A',
  Health: '#43A047',
  Education: '#5C6BC0',
  Gaming: '#F06292',
  Utilities: '#8D6E63',
  Other: COLORS.outline,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export default function AnalyticsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { subscriptions, isLoading, totalMonthly } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const categoryTotals = useMemo(() => {
    const base = Object.fromEntries(
      ANALYTICS_CATEGORIES.map((category) => [category, 0])
    ) as Record<AnalyticsCategory, number>;

    subscriptions.forEach((subscription) => {
      const monthlyAmount = toMonthlyAmount(subscription);
      const category = ANALYTICS_CATEGORIES.includes(subscription.category as AnalyticsCategory)
        ? (subscription.category as AnalyticsCategory)
        : 'Other';
      base[category] += monthlyAmount;
    });

    return base;
  }, [subscriptions]);

  const segments: SpendSegment[] = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      value,
      color: CATEGORY_COLORS[category as AnalyticsCategory],
      label: category,
    }));

  const weeklyData = useMemo(() => {
    const data = WEEK_DAYS.map((day) => ({ day, amount: 0 }));

    subscriptions.forEach((subscription) => {
      const monthlyAmount = toMonthlyAmount(subscription);
      const dayIndex = subscription.renewalDays % WEEK_DAYS.length;
      data[dayIndex].amount += monthlyAmount;
    });

    return data;
  }, [subscriptions]);

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  const monthly = totalMonthly();
  const yearly = monthly * 12;
  const maxWeekly = Math.max(...weeklyData.map((item) => item.amount), 1);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Analytics</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthRail}>
        {MONTHS.map((month, index) => (
          <Pressable
            key={month}
            style={[styles.monthPill, selectedMonth === index && styles.monthPillActive]}
            onPress={() => setSelectedMonth(index)}
          >
            <Text style={[styles.monthText, selectedMonth === index && styles.monthTextActive]}>
              {month}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.summaryRow}>
        <SummaryPill label="Monthly" value={fmt(Math.round(monthly))} />
        <SummaryPill label="Yearly" value={fmt(Math.round(yearly))} />
        <SummaryPill label="Active" value={`${subscriptions.length}`} />
      </View>

      {segments.length > 0 ? (
        <View style={styles.ringContainer}>
          <SpendRing
            segments={segments}
            size={220}
            strokeWidth={22}
            centerLabel="monthly"
            centerValue={monthly}
          />
        </View>
      ) : (
        <View style={styles.emptyRing}>
          <Text style={styles.emptyText}>No subscription data yet</Text>
        </View>
      )}

      <Text style={styles.sectionHeader}>By Category</Text>
      <View style={styles.categoryList}>
        {ANALYTICS_CATEGORIES.map((category) => {
          const value = categoryTotals[category];
          const pct = ((value || 0) / (monthly || 1)) * 100;
          return (
            <CategoryBar
              key={category}
              label={category}
              value={value}
              pct={pct}
              color={CATEGORY_COLORS[category]}
            />
          );
        })}
      </View>

      <Text style={styles.sectionHeader}>Weekly Distribution</Text>
      <View style={styles.barChartCard}>
        <View style={styles.gridLineTop} />
        <View style={styles.gridLineMid} />
        <View style={styles.plotArea}>
          {weeklyData.map((item) => (
            <WeeklyBar
              key={item.day}
              day={item.day}
              amount={item.amount}
              ratio={item.amount / maxWeekly}
            />
          ))}
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function toMonthlyAmount(subscription: Subscription): number {
  if (subscription.cycle === 'monthly') return subscription.amount;
  if (subscription.cycle === 'quarterly') return subscription.amount / 3;
  if (subscription.cycle === 'yearly') return subscription.amount / 12;
  return subscription.amount;
}

function SummaryPill({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function compactCurrency(amount: number): string {
  if (amount >= 1000) {
    return `Rs ${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
  }
  return `Rs ${Math.round(amount)}`;
}

function CategoryBar({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: number;
  pct: number;
  color: string;
}): React.JSX.Element {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(pct, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [pct, width]);

  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View style={styles.catRow}>
      <View style={styles.catHeader}>
        <View style={[styles.catDot, { backgroundColor: color }]} />
        <Text style={styles.catLabel}>{label}</Text>
        <Text style={styles.catValue}>{fmt(Math.round(value))}</Text>
        <Text style={styles.catPct}>{pct.toFixed(0)}%</Text>
      </View>
      <View style={styles.catTrack}>
        <Animated.View style={[styles.catFill, { backgroundColor: color }, barStyle]} />
      </View>
    </View>
  );
}

function WeeklyBar({
  day,
  amount,
  ratio,
}: {
  day: string;
  amount: number;
  ratio: number;
}): React.JSX.Element {
  const animatedRatio = useSharedValue(0);

  useEffect(() => {
    animatedRatio.value = withTiming(ratio, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [ratio, animatedRatio]);

  const fillStyle = useAnimatedStyle(() => ({
    height: `${Math.max(6, animatedRatio.value * 100)}%`,
  }));

  return (
    <View style={styles.barColumn}>
      <Text style={styles.barAmount}>{amount > 0 ? compactCurrency(amount) : ' '}</Text>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, fillStyle]} />
      </View>
      <Text style={styles.barLabel}>{day}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  content: { paddingHorizontal: 24, gap: 20 },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#e7e5e4', fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },

  monthRail: { gap: 8, paddingRight: 24 },
  monthPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: '#252626',
  },
  monthPillActive: { backgroundColor: '#454747', borderColor: '#767575' },
  monthText: { color: '#767575', fontSize: 13, fontWeight: '500' },
  monthTextActive: { color: '#e7e5e4' },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryPill: {
    flex: 1,
    backgroundColor: '#131313',
    borderRadius: 14,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#252626',
  },
  summaryLabel: { color: '#767575', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  summaryValue: { color: '#e7e5e4', fontSize: 18, fontWeight: '700' },

  ringContainer: { alignItems: 'center', paddingVertical: 8 },
  emptyRing: { height: 160, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#767575', fontSize: 14 },

  sectionHeader: { color: '#acabaa', fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  categoryList: { gap: 14 },

  catRow: { gap: 6 },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { color: '#e7e5e4', fontSize: 13, flex: 1 },
  catValue: { color: '#ffbf00', fontSize: 13, fontWeight: '600' },
  catPct: { color: '#767575', fontSize: 12, width: 36, textAlign: 'right' },
  catTrack: { height: 6, backgroundColor: '#252626', borderRadius: 3, overflow: 'hidden' },
  catFill: { height: 6, borderRadius: 3 },

  barChartCard: {
    position: 'relative',
    backgroundColor: '#131313',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#252626',
    overflow: 'hidden',
  },
  gridLineTop: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 58,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  gridLineMid: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 112,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  plotArea: {
    height: 180,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    overflow: 'hidden',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    minWidth: 0,
  },
  barAmount: {
    color: '#acabaa',
    fontSize: 10,
    width: '100%',
    textAlign: 'center',
    minHeight: 14,
  },
  barTrack: {
    width: '100%',
    maxWidth: 34,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255,191,0,0.08)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    minHeight: 6,
    borderRadius: 12,
    backgroundColor: '#ffbf00',
  },
  barLabel: {
    color: '#767575',
    fontSize: 10,
  },
});
