import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function AboutScreen(): React.JSX.Element {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>About SpendSync</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Financial command center</Text>
        <Text style={styles.heroTitle}>Track cards, subscriptions, and spend in one place.</Text>
        <Text style={styles.heroBody}>
          SpendSync gives you a clear view of recurring charges, card-level spend, and
          upcoming renewals so you can stay in control of your monthly outflow.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>What you can do</Text>
        <Text style={styles.sectionBody}>Review active subscriptions and their monthly impact.</Text>
        <Text style={styles.sectionBody}>Compare cards with the card optimizer.</Text>
        <Text style={styles.sectionBody}>Add new cards and keep your wallet organized.</Text>
        <Text style={styles.sectionBody}>Check analytics for category and spend trends.</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        <Text style={styles.sectionBody}>
          The fixed top bar and left sidebar stay visible while the current page renders in the
          remaining content area.
        </Text>
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
  heroCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  heroEyebrow: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: COLORS.onSurface,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  heroBody: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 18,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sectionTitle: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionBody: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
  },
});
