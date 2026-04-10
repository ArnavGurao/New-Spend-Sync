// ── FILE: app/advisor.tsx ─────────────────────────────────────────────────────
// Card Advisor — static recommendations, search, category filters.

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

interface AdvisorCard {
  id: string;
  name: string;
  bank: string;
  category: string;
  tagline: string;
  annualFee: number;
  rewardRate: string;
  highlights: string[];
  gradient: [string, string];
  score: number;
}

const ADVISOR_CARDS: AdvisorCard[] = [
  {
    id: 'hdfc_regalia',
    name: 'HDFC Regalia',
    bank: 'HDFC Bank',
    category: 'Travel',
    tagline: 'Best for dining and travel rewards',
    annualFee: 2500,
    rewardRate: '4 pts per ₹150',
    highlights: ['Airport lounge access', 'Dining 2x rewards', 'Fuel surcharge waiver', '1000 milestone pts'],
    gradient: ['#8b1d1d', '#4c0519'],
    score: 94,
  },
  {
    id: 'hdfc_dining',
    name: 'HDFC Regalia Dining',
    bank: 'HDFC Bank',
    category: 'Dining',
    tagline: 'Maximise every restaurant visit',
    annualFee: 1500,
    rewardRate: '6 pts per ₹150 on dining',
    highlights: ['6x dining rewards', 'Free movie tickets', 'Zomato Pro membership', 'Weekend dining cashback'],
    gradient: ['#E65C00', '#993D00'],
    score: 88,
  },
  {
    id: 'icici_amazon',
    name: 'ICICI Amazon Pay',
    bank: 'ICICI Bank',
    category: 'Shopping',
    tagline: 'India\'s best card for Amazon & OTT',
    annualFee: 0,
    rewardRate: '5% on Amazon Prime orders',
    highlights: ['5% on Amazon Prime', '2% on OTT services', 'Free Amazon Prime', 'No annual fee'],
    gradient: ['#FF9900', '#B36B00'],
    score: 91,
  },
  {
    id: 'axis_magnus',
    name: 'Axis MAGNUS',
    bank: 'Axis Bank',
    category: 'Lifestyle',
    tagline: 'Ultra-premium lifestyle & travel',
    annualFee: 10000,
    rewardRate: '12 EDGE pts per ₹200',
    highlights: ['Unlimited airport lounge', 'Golf rounds included', 'Hotel status match', 'Concierge service'],
    gradient: ['#4A0E1C', '#2D0911'],
    score: 96,
  },
];

const FILTER_CATEGORIES = ['All Recommendations', 'Dining', 'OTT', 'Fuel', 'Travel', 'Shopping'];

export default function AdvisorScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Recommendations');

  const filtered = useMemo(() => {
    return ADVISOR_CARDS.filter((card) => {
      const matchSearch =
        card.name.toLowerCase().includes(search.toLowerCase()) ||
        card.bank.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        activeFilter === 'All Recommendations' ||
        card.category.toLowerCase() === activeFilter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [search, activeFilter]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Card Advisor</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search cards, banks…"
            placeholderTextColor={COLORS.outlineVariant}
            keyboardAppearance="dark"
          />
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTER_CATEGORIES.map((f) => (
            <Pressable
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Smart Picks horizontal */}
        <Text style={styles.sectionTitle}>Smart Picks For You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.smartPicksScroll}>
          {ADVISOR_CARDS.slice(0, 3).map((card) => (
            <LinearGradient
              key={card.id}
              colors={card.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.smartPick}
            >
              <Text style={styles.smartPickScore}>{card.score}% match</Text>
              <Text style={styles.smartPickName}>{card.name}</Text>
              <Text style={styles.smartPickTag}>{card.tagline}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Full card list */}
        <Text style={styles.sectionTitle}>All Recommendations</Text>
        {filtered.map((card) => (
          <AdvisorCardDetail key={card.id} card={card} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function AdvisorCardDetail({ card }: { card: AdvisorCard }): React.JSX.Element {
  const [expanded, setExpanded] = useState(card.score > 90);
  return (
    <View style={styles.cardDetail}>
      <LinearGradient colors={card.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardDetailHeader}>
        <View>
          <Text style={styles.cardDetailBank}>{card.bank}</Text>
          <Text style={styles.cardDetailName}>{card.name}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{card.score}%</Text>
        </View>
      </LinearGradient>

      <View style={styles.cardDetailBody}>
        <Text style={styles.tagline}>{card.tagline}</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Annual Fee</Text>
            <Text style={styles.metricValue}>{card.annualFee === 0 ? 'FREE' : `₹${card.annualFee.toLocaleString('en-IN')}`}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Reward Rate</Text>
            <Text style={styles.metricValue}>{card.rewardRate}</Text>
          </View>
        </View>

        {expanded && (
          <View style={styles.highlights}>
            {card.highlights.map((h, i) => (
              <View key={i} style={styles.highlightRow}>
                <Text style={styles.highlightIcon}>✓</Text>
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable style={styles.expandBtn} onPress={() => setExpanded(!expanded)}>
          <Text style={styles.expandBtnText}>{expanded ? 'Show less ▲' : 'Show features ▼'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

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
  content: { padding: 20, gap: 16 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1f2020', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#484848',
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: '#e7e5e4', fontSize: 14 },

  filterScroll: { marginHorizontal: -20 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginHorizontal: 4,
    backgroundColor: '#131313', borderWidth: 1, borderColor: '#252626',
  },
  filterPillActive: { backgroundColor: '#454747', borderColor: '#767575' },
  filterText: { color: '#767575', fontSize: 12, fontWeight: '500' },
  filterTextActive: { color: '#e7e5e4' },

  sectionTitle: { color: '#acabaa', fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },

  smartPicksScroll: { marginHorizontal: -20 },
  smartPick: {
    width: 200, borderRadius: 16, padding: 16, marginHorizontal: 4,
    gap: 4, height: 110,
  },
  smartPickScore: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  smartPickName: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 },
  smartPickTag: { color: 'rgba(255,255,255,0.6)', fontSize: 10, lineHeight: 14 },

  cardDetail: {
    backgroundColor: '#131313', borderRadius: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: '#252626',
  },
  cardDetailHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDetailBank: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  cardDetailName: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 2 },
  scoreBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  scoreText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cardDetailBody: { padding: 16, gap: 12 },
  tagline: { color: '#acabaa', fontSize: 13 },
  metricsRow: { flexDirection: 'row', gap: 12 },
  metric: { flex: 1, backgroundColor: '#1f2020', borderRadius: 10, padding: 12, gap: 2 },
  metricLabel: { color: '#767575', fontSize: 10, letterSpacing: 0.5 },
  metricValue: { color: '#ffbf00', fontSize: 13, fontWeight: '700' },
  highlights: { gap: 8 },
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  highlightIcon: { color: COLORS.brandTeal, fontSize: 13, fontWeight: '700', marginTop: 1 },
  highlightText: { color: '#e7e5e4', fontSize: 13, flex: 1 },
  expandBtn: { paddingVertical: 6 },
  expandBtnText: { color: '#767575', fontSize: 12, textAlign: 'center' },
});
