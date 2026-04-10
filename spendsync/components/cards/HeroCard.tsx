// ── FILE: components/cards/HeroCard.tsx ──────────────────────────────────────
// Full-width 3D flippable card for card detail screen.

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { CreditCard } from './CreditCard';
import type { Card, Subscription } from '../../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

interface HeroCardProps {
  card: Card;
  subscriptions: Subscription[];
}

export function HeroCard({ card, subscriptions }: HeroCardProps): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      <CreditCard
        card={card}
        subscriptions={subscriptions}
        size="hero"
        flippable={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
});
