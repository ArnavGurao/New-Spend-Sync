import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/formatters';
import { COLORS } from '../constants/theme';

export default function ProfileScreen(): React.JSX.Element {
  const cards = useStore((state) => state.cards);
  const subscriptions = useStore((state) => state.subscriptions);
  const monthlyTotal = useStore((state) => state.totalMonthly());

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Your Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.name}>Rahul</Text>
          <Text style={styles.subtitle}>SpendSync account overview</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{cards.length}</Text>
          <Text style={styles.metricLabel}>Cards</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{subscriptions.length}</Text>
          <Text style={styles.metricLabel}>Subscriptions</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{fmt(Math.round(monthlyTotal))}</Text>
          <Text style={styles.metricLabel}>Monthly</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Account details</Text>
        <Text style={styles.infoRow}>Name: Rahul</Text>
        <Text style={styles.infoRow}>Membership: Premium</Text>
        <Text style={styles.infoRow}>Region: India</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 24,
    gap: 20,
  },
  title: {
    color: COLORS.onSurface,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.onSurface,
    fontSize: 28,
    fontWeight: '700',
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: COLORS.onSurface,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  metricValue: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '700',
  },
  metricLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 18,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  infoTitle: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
});
