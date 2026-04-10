import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CreditCard } from './CreditCard';
import type { Card, Subscription } from '../../store/useStore';

const MAX_CARD_WIDTH = 760;

interface HeroCardProps {
  card: Card;
  subscriptions: Subscription[];
}

export function HeroCard({ card, subscriptions }: HeroCardProps): React.JSX.Element {
  const [availableWidth, setAvailableWidth] = useState(0);

  const cardWidth = useMemo(() => {
    if (availableWidth <= 0) return MAX_CARD_WIDTH;
    return Math.min(availableWidth, MAX_CARD_WIDTH);
  }, [availableWidth]);

  return (
    <View
      style={styles.wrapper}
      onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width - 48)}
    >
      <View style={[styles.cardFrame, { width: cardWidth }]}>
        <CreditCard
          card={card}
          subscriptions={subscriptions}
          size="hero"
          flippable={true}
          cardWidth={cardWidth}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 24,
  },
  cardFrame: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
});
