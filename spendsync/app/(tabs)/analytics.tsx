// ── FILE: app/(tabs)/analytics.tsx ───────────────────────────────────────────

import React, { useState, useEffect } from 'react';
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
import type { Category } from '../../store/useStore';

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: COLORS.chart1,
  Food:          COLORS.chart2,
  Shopping:      COLORS.chart3,
  Travel:        '#9C27B0',
  Productivity:  COLORS.chart4,
  Cloud:         COLORS.chart5,
  Professional:  '#00BCD4',
  Other:         COLORS.outline,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { subscriptions, isLoading, totalMonthly } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  // Build category breakdown
  const categoryMap: Partial<Record<Category, number>> = {};
  subscriptions.forEach((sub) => {
    const monthly = sub.cycle === 'monthly' ? sub.amount :
      sub.cycle === 'quarterly' ? sub.amount / 3 :
      sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount;
    categoryMap[sub.category] = (categoryMap[sub.category] ?? 0) + monthly;
  });

  const segments: SpendSegment[] = Object.entries(categoryMap).map(([cat, val]) => ({
    value: val ?? 0,
    color: CATEGORY_COLORS[cat as Category] ?? COLORS.outline,
    label: cat,
  }));

  const monthly = totalMonthly();
  const yearly = monthly * 12;

  // Weekly mock data
  const weeklyData = [
    { day: 'Mon', amount: 649 },
    { day: 'Tue', amount: 299 },
    { day: 'Wed', amount: 0 },
    { day: 'Thu', amount: 499 },
    { day: 'Fri', amount: 189 },
    { day: 'Sat', amount: 0 },
    { day: 'Sun', amount: 119 },
  ];
  const maxWeekly = Math.max(...weeklyData.map((d) => d.amount), 1);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Analytics</Text>

      {/* Month picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
        {MONTHS.map((m, i) => (
          <Pressable
            key={m}
            style={[styles.monthPill, selectedMonth === i && styles.monthPillActive]}
            onPress={() => setSelectedMonth(i)}
          >
            <Text style={[styles.monthText, selectedMonth === i && styles.monthTextActive]}>{m}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Summary pills */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryLabel}>Monthly</Text>
          <Text style={styles.summaryValue}>{fmt(Math.round(monthly))}</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryLabel}>Yearly</Text>
          <Text style={styles.summaryValue}>{fmt(Math.round(yearly))}</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryLabel}>Active</Text>
          <Text style={styles.summaryValue}>{subscriptions.length}</Text>
        </View>
      </View>

      {/* Spend Ring */}
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

      {/* Category Breakdown */}
      <Text style={styles.sectionHeader}>By Category</Text>
      {Object.entries(categoryMap).map(([cat, val]) => {
        const pct = ((val ?? 0) / (monthly || 1)) * 100;
        return (
          <CategoryBar
            key={cat}
            label={cat}
            value={val ?? 0}
            pct={pct}
            color={CATEGORY_COLORS[cat as Category] ?? COLORS.outline}
          />
        );
      })}

      {/* Weekly Distribution */}
      <Text style={styles.sectionHeader}>Weekly Distribution</Text>
      <View style={styles.barChart}>
        {weeklyData.map((d) => (
          <View key={d.day} style={styles.barColumn}>
            <View style={[styles.bar, { height: Math.max(4, (d.amount / maxWeekly) * 120) }]} />
            <Text style={styles.barLabel}>{d.day}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function CategoryBar({
  label, value, pct, color,
}: {
  label: string; value: number; pct: number; color: string;
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  content: { paddingHorizontal: 24, gap: 20 },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#e7e5e4', fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },

  monthScroll: { marginHorizontal: -24 },
  monthPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, marginHorizontal: 4,
    backgroundColor: '#131313',
    borderWidth: 1, borderColor: '#252626',
  },
  monthPillActive: { backgroundColor: '#454747', borderColor: '#767575' },
  monthText: { color: '#767575', fontSize: 13, fontWeight: '500' },
  monthTextActive: { color: '#e7e5e4' },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryPill: { flex: 1, backgroundColor: '#131313', borderRadius: 14, padding: 14, gap: 4, borderWidth: 1, borderColor: '#252626' },
  summaryLabel: { color: '#767575', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  summaryValue: { color: '#e7e5e4', fontSize: 18, fontWeight: '700' },

  ringContainer: { alignItems: 'center', paddingVertical: 8 },
  emptyRing: { height: 160, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#767575', fontSize: 14 },

  sectionHeader: { color: '#acabaa', fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },

  catRow: { gap: 6 },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { color: '#e7e5e4', fontSize: 13, flex: 1 },
  catValue: { color: '#ffbf00', fontSize: 13, fontWeight: '600' },
  catPct: { color: '#767575', fontSize: 12, width: 36, textAlign: 'right' },
  catTrack: { height: 6, backgroundColor: '#252626', borderRadius: 3, overflow: 'hidden' },
  catFill: { height: 6, borderRadius: 3 },

  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, backgroundColor: '#131313', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#252626' },
  barColumn: { alignItems: 'center', gap: 6, flex: 1 },
  bar: { width: 20, backgroundColor: '#ffbf00', borderRadius: 4, opacity: 0.8 },
  barLabel: { color: '#767575', fontSize: 10 },
});
