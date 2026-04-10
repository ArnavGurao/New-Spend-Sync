// ── FILE: app/dna.tsx ─────────────────────────────────────────────────────────
// Subscription DNA screen — persona, stat pills, peer insights, life-stage timeline.

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/formatters';
import { COLORS } from '../constants/theme';

const PEER_INSIGHTS = [
  { name: 'Adobe Creative Cloud', pct: 78, icon: '🖌️', category: 'Productivity' },
  { name: 'Notion',                pct: 62, icon: '📝', category: 'Productivity' },
  { name: 'LinkedIn Premium',      pct: 45, icon: '💼', category: 'Professional' },
];

const TIMELINE_NODES = [
  { label: 'Student',           year: '2019', active: false },
  { label: 'Young Professional', year: '2022', active: false },
  { label: 'Creator',           year: '2024', active: true  },
];

const TRANSITION_TAGS = [
  '+ Adobe Creative Cloud',
  '+ Figma (trial)',
  '↑ Entertainment spend +32%',
  'Zomato → Swiggy switch',
];

export default function DNAScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subscriptions, totalMonthly, cards } = useStore();

  // Pulsing teal dot
  const dotScale = useSharedValue(1);
  useEffect(() => {
    dotScale.value = withRepeat(
      withTiming(1.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, [dotScale]);
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: dotScale.value }] }));

  // Animated progress bars
  const progressValues = PEER_INSIGHTS.map(() => useSharedValue(0));
  useEffect(() => {
    PEER_INSIGHTS.forEach((_, i) => {
      progressValues[i].value = withSpring(PEER_INSIGHTS[i].pct, { damping: 18, stiffness: 80 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthly = totalMonthly();

  const STAT_PILLS = [
    { label: 'Active subs',   value: `${subscriptions.length}` },
    { label: 'Monthly',       value: fmt(Math.round(monthly)) },
    { label: 'Cards',         value: `${cards.length}` },
    { label: 'Creator cluster', value: 'Top 12%' },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Subscription DNA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Persona hero card */}
        <View style={styles.personaCard}>
          <View style={styles.personaHeader}>
            <View style={styles.personaTitleRow}>
              <Text style={styles.personaName}>The Creator</Text>
              <View style={styles.activeDotWrapper}>
                <Animated.View style={[styles.activeDotPulse, dotStyle]} />
                <View style={styles.activeDotCore} />
              </View>
            </View>
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>94% match</Text>
            </View>
          </View>
          <Text style={styles.personaDesc}>
            Creative professionals who invest in tools that amplify their output.
            High affinity for Adobe ecosystem, content platforms, and cloud storage.
          </Text>
          <View style={styles.personaTags}>
            {['Creative', 'Tech-forward', 'Value-conscious', 'Content creator'].map((t) => (
              <View key={t} style={styles.personaTag}>
                <Text style={styles.personaTagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stat pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statScroll}>
          {STAT_PILLS.map((s) => (
            <View key={s.label} style={styles.statPill}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Peer insights */}
        <Text style={styles.sectionTitle}>Creators Like You Also Use</Text>
        {PEER_INSIGHTS.map((insight, i) => (
          <View key={insight.name} style={styles.insightRow}>
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <View style={styles.insightContent}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightName}>{insight.name}</Text>
                <Text style={styles.insightPct}>{insight.pct}%</Text>
              </View>
              <Text style={styles.insightCategory}>{insight.category}</Text>
              <View style={styles.insightTrack}>
                <ProgressBar progress={progressValues[i]} />
              </View>
            </View>
          </View>
        ))}

        {/* Life-stage alert */}
        <View style={styles.lifeStageAlert}>
          <Text style={styles.lifeStageTitle}>🔄 Recent Life-Stage Transition</Text>
          <Text style={styles.lifeStageSub}>
            Your subscription profile shifted significantly in the last 6 months:
          </Text>
          <View style={styles.transitionTags}>
            {TRANSITION_TAGS.map((t) => (
              <View key={t} style={styles.transitionTag}>
                <Text style={styles.transitionTagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* DNA Timeline */}
        <Text style={styles.sectionTitle}>DNA Timeline</Text>
        <View style={styles.timeline}>
          {TIMELINE_NODES.map((node, i) => (
            <View key={node.label} style={styles.timelineNode}>
              <View style={[styles.timelineDot, node.active && styles.timelineDotActive]} />
              {i < TIMELINE_NODES.length - 1 && <View style={styles.timelineLine} />}
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, node.active && styles.timelineLabelActive]}>
                  {node.label}
                </Text>
                <Text style={styles.timelineYear}>{node.year}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function ProgressBar({ progress }: { progress: ReturnType<typeof useSharedValue<number>> }): React.JSX.Element {
  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));
  return (
    <View style={pbStyles.track}>
      <Animated.View style={[pbStyles.fill, barStyle]} />
    </View>
  );
}

const pbStyles = StyleSheet.create({
  track: { height: 4, backgroundColor: '#252626', borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: COLORS.brandTeal, borderRadius: 2 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#252626',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#e7e5e4', fontSize: 28, lineHeight: 32 },
  headerTitle: { color: '#e7e5e4', fontSize: 16, fontWeight: '700' },
  content: { padding: 20, gap: 20 },

  personaCard: {
    backgroundColor: '#131313', borderRadius: 20,
    borderWidth: 1, borderColor: '#252626', padding: 20, gap: 12,
  },
  personaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  personaTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  personaName: { color: '#e7e5e4', fontSize: 24, fontWeight: '700' },
  activeDotWrapper: { position: 'relative', width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  activeDotPulse: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,201,167,0.3)' },
  activeDotCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.brandTeal },
  matchBadge: { backgroundColor: 'rgba(0,201,167,0.12)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(0,201,167,0.25)' },
  matchText: { color: COLORS.brandTeal, fontSize: 13, fontWeight: '700' },
  personaDesc: { color: '#acabaa', fontSize: 13, lineHeight: 19 },
  personaTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  personaTag: { backgroundColor: '#1f2020', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#484848' },
  personaTagText: { color: '#acabaa', fontSize: 11 },

  statScroll: { marginHorizontal: -20 },
  statPill: {
    backgroundColor: '#131313', borderRadius: 14, padding: 14,
    marginHorizontal: 4, minWidth: 100, gap: 4,
    borderWidth: 1, borderColor: '#252626',
  },
  statValue: { color: '#e7e5e4', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#767575', fontSize: 10, letterSpacing: 0.5 },

  sectionTitle: { color: '#acabaa', fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },

  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#131313', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#252626' },
  insightIcon: { fontSize: 22, marginTop: 2 },
  insightContent: { flex: 1, gap: 4 },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  insightName: { color: '#e7e5e4', fontSize: 13, fontWeight: '600', flex: 1 },
  insightPct: { color: COLORS.brandTeal, fontSize: 13, fontWeight: '700' },
  insightCategory: { color: '#767575', fontSize: 11 },
  insightTrack: { marginTop: 4 },

  lifeStageAlert: {
    backgroundColor: 'rgba(255,191,0,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,191,0,0.15)',
    borderRadius: 16, padding: 16, gap: 8,
  },
  lifeStageTitle: { color: '#e7e5e4', fontSize: 14, fontWeight: '700' },
  lifeStageSub: { color: '#acabaa', fontSize: 12, lineHeight: 17 },
  transitionTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  transitionTag: { backgroundColor: 'rgba(255,191,0,0.08)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,191,0,0.2)' },
  transitionTagText: { color: '#ffbf00', fontSize: 11, fontWeight: '500' },

  timeline: { gap: 0 },
  timelineNode: { flexDirection: 'row', alignItems: 'flex-start', position: 'relative', paddingBottom: 24 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#252626', borderWidth: 2, borderColor: '#484848', marginTop: 4, marginRight: 16, zIndex: 1 },
  timelineDotActive: { backgroundColor: COLORS.brandTeal, borderColor: COLORS.brandTeal },
  timelineLine: { position: 'absolute', left: 5, top: 16, bottom: 0, width: 2, backgroundColor: '#252626' },
  timelineContent: { flex: 1, gap: 2 },
  timelineLabel: { color: '#acabaa', fontSize: 14, fontWeight: '600' },
  timelineLabelActive: { color: COLORS.brandTeal },
  timelineYear: { color: '#767575', fontSize: 11 },
});
