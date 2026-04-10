// Dashboard screen - greeting, hero spend, stacked card deck, optimize banner, SMS simulation.

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useStore } from '../../store/useStore';
import { StackedCardDeck } from '../../components/cards/StackedCardDeck';
import { SMSBottomSheet } from '../../components/sms/SMSBottomSheet';
import { fmt, getGreeting } from '../../lib/formatters';
import { simulateIncomingSMS } from '../../lib/smsSync';
import { COLORS } from '../../constants/theme';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { getSubscriptionLogoUri } from '../../constants/logoMap';
import type { ParsedSMS } from '../../lib/smsSync';

export default function DashboardScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cards, subscriptions, isLoading, totalMonthly, urgentCount, setSMSFlow, resetSMSFlow } = useStore();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeSMS, setActiveSMS] = useState<ParsedSMS | null>(null);

  const pulseScale = useSharedValue(1);
  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.25, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulseScale]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  const handleSimulateSMS = useCallback(() => {
    const next = simulateIncomingSMS();
    if (!next) return;
    resetSMSFlow();
    setSMSFlow({ pendingSMS: next, step: 1 });
    setActiveSMS(next);
    setSheetVisible(true);
  }, [resetSMSFlow, setSMSFlow]);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setActiveSMS(null);
    resetSMSFlow();
  }, [resetSMSFlow]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Loading SpendSync...</Text>
      </View>
    );
  }

  const monthlyTotal = totalMonthly();
  const yearlyTotal = monthlyTotal * 12;
  const urgentNum = urgentCount();

  return (
    <View style={[styles.root, { backgroundColor: COLORS.surfaceContainerLowest }]}>
      <LinearGradient
        colors={['rgba(198,198,199,0.06)', 'transparent']}
        style={[styles.halo, { height: 128 + insets.top }]}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 18,
            paddingBottom: insets.bottom + 136,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={styles.greetingRow}>
            <View style={styles.greetingCopy}>
              <Text style={styles.greeting}>{getGreeting()}, Rahul</Text>
              <Text style={styles.greetingSub}>Here's your financial snapshot</Text>
            </View>
            {urgentNum > 0 && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>{urgentNum} urgent</Text>
              </View>
            )}
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>TOTAL MONTHLY SUBSCRIPTIONS</Text>
            <Text style={styles.heroAmount}>{fmt(Math.round(monthlyTotal))}</Text>
            <View style={styles.yearlyPill}>
              <Text style={styles.yearlyText}>{fmt(Math.round(yearlyTotal))} / year</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Your Wallet</Text>
          {cards.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyTitle}>No cards yet</Text>
              <Text style={styles.emptySub}>Add your first credit card to start tracking</Text>
              <Pressable style={styles.emptyButton} onPress={() => router.push('/add-card')}>
                <Text style={styles.emptyButtonText}>Add Card</Text>
              </Pressable>
            </View>
          ) : (
            <StackedCardDeck cards={cards} subscriptions={subscriptions} />
          )}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.optimizeBanner}>
            <Animated.Text style={[styles.optimizeIcon, pulseStyle]}>✨</Animated.Text>
            <View style={styles.optimizeContent}>
              <Text style={styles.optimizeTitle}>Optimize your subscriptions</Text>
              <Text style={styles.optimizeSub}>
                SpendSync found potential savings based on your spending patterns
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickCard} onPress={() => router.push('/advisor')}>
              <Text style={styles.quickIcon}>💎</Text>
              <Text style={styles.quickLabel}>Card Advisor</Text>
              <Text style={styles.quickSub}>Best card per spend</Text>
            </Pressable>
            <Pressable style={styles.quickCard} onPress={() => router.push('/dna')}>
              <Text style={styles.quickIcon}>🧬</Text>
              <Text style={styles.quickLabel}>Your DNA</Text>
              <Text style={styles.quickSub}>Spending persona</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Pressable style={styles.simulateButton} onPress={handleSimulateSMS}>
            <Text style={styles.simulateIcon}>📩</Text>
            <Text style={styles.simulateText}>Simulate Incoming SMS</Text>
          </Pressable>
        </View>

        {subscriptions.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Active Subscriptions</Text>
            <View style={styles.subscriptionList}>
              {subscriptions.slice(0, 5).map((sub) => {
                const card = cards.find((c) => c.id === sub.cardId);
                return (
                  <View key={sub.id} style={styles.subRow}>
                    <View style={styles.subRowLeft}>
                      <BrandLogo
                        label={sub.name}
                        uri={getSubscriptionLogoUri(sub.name)}
                        size={42}
                      />
                      <View style={styles.subCopy}>
                        <Text style={styles.subName}>{sub.name}</Text>
                        <Text style={styles.subMeta}>{card?.variant ?? 'Unknown card'}</Text>
                      </View>
                    </View>
                    <Text style={styles.subAmount}>{fmt(sub.amount)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <SMSBottomSheet visible={sheetVisible} sms={activeSMS} onClose={handleCloseSheet} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  halo: { position: 'absolute', top: 0, left: 0, right: 0 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: { color: '#acabaa', fontSize: 14 },
  scrollContent: { paddingHorizontal: 24, gap: 28 },
  topSection: { gap: 22 },
  sectionBlock: { gap: 14 },

  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  greetingCopy: {
    flex: 1,
    paddingRight: 8,
  },
  greeting: {
    color: '#e7e5e4',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  greetingSub: {
    color: '#acabaa',
    fontSize: 13,
    marginTop: 6,
  },
  urgentBadge: {
    backgroundColor: 'rgba(238,125,119,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(238,125,119,0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 4,
  },
  urgentBadgeText: { color: '#ee7d77', fontSize: 12, fontWeight: '700' },

  heroCard: {
    backgroundColor: '#131313',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    minHeight: 164,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#252626',
  },
  heroLabel: {
    color: '#767575',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroAmount: {
    color: '#e7e5e4',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -2,
  },
  yearlyPill: {
    backgroundColor: 'rgba(37,38,38,0.8)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 12,
  },
  yearlyText: { color: '#acabaa', fontSize: 12 },

  sectionTitle: {
    color: '#acabaa',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingLeft: 2,
  },

  emptyState: {
    backgroundColor: '#131313',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#252626',
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: '#e7e5e4', fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#acabaa', fontSize: 13, textAlign: 'center' },
  emptyButton: {
    backgroundColor: '#454747',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 8,
  },
  emptyButtonText: { color: '#e7e5e4', fontWeight: '600' },

  optimizeBanner: {
    backgroundColor: 'rgba(198,198,199,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(198,198,199,0.1)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  optimizeIcon: { fontSize: 28 },
  optimizeContent: { flex: 1 },
  optimizeTitle: { color: '#e7e5e4', fontSize: 14, fontWeight: '600' },
  optimizeSub: { color: '#acabaa', fontSize: 12, marginTop: 2, lineHeight: 17 },

  quickActions: { flexDirection: 'row', gap: 14 },
  quickCard: {
    flex: 1,
    backgroundColor: '#131313',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 6,
    minHeight: 112,
    borderWidth: 1,
    borderColor: '#252626',
  },
  quickIcon: { fontSize: 24, marginBottom: 4 },
  quickLabel: { color: '#e7e5e4', fontSize: 14, fontWeight: '600' },
  quickSub: { color: '#acabaa', fontSize: 11 },

  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1f2020',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 58,
    borderWidth: 1,
    borderColor: '#484848',
  },
  simulateIcon: { fontSize: 18 },
  simulateText: { color: '#e7e5e4', fontSize: 14, fontWeight: '600' },

  subscriptionList: { gap: 12 },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#131313',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#252626',
  },
  subRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  subCopy: { gap: 4, flex: 1 },
  subName: { color: '#e7e5e4', fontSize: 15, fontWeight: '600' },
  subMeta: { color: '#acabaa', fontSize: 12 },
  subAmount: { color: '#ffbf00', fontSize: 14, fontWeight: '700' },
});
