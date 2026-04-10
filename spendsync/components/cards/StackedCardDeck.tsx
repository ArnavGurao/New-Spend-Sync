// ── FILE: components/cards/StackedCardDeck.tsx ────────────────────────────────

import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CreditCard } from './CreditCard';
import type { Card, Subscription } from '../../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = 192;
const STACK_OFFSET = 56; // vertical offset per card in stack

interface StackedCardDeckProps {
  cards: Card[];
  subscriptions: Subscription[];
}

export function StackedCardDeck({ cards, subscriptions }: StackedCardDeckProps): React.JSX.Element {
  const router = useRouter();

  // One shared value per card for translateY animation
  const translateYValues = cards.map(() => useSharedValue(40));
  const scaleValues = cards.map(() => useSharedValue(1));

  useEffect(() => {
    cards.forEach((_, i) => {
      // Stagger: 80ms delay per card index
      translateYValues[i].value = withDelay(
        i * 80,
        withSpring(0, { damping: 15, stiffness: 120 })
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  const stackHeight = CARD_HEIGHT + (cards.length - 1) * STACK_OFFSET + 32;

  const handleCardPress = (card: Card, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Animate up on press
    scaleValues[index].value = withSpring(1.02, { damping: 12, stiffness: 200 });
    translateYValues[index].value = withSpring(-14, { damping: 12, stiffness: 200 });

    setTimeout(() => {
      scaleValues[index].value = withSpring(1, { damping: 15, stiffness: 120 });
      translateYValues[index].value = withSpring(0, { damping: 15, stiffness: 120 });
      router.push(`/subscriptions/${card.id}`);
    }, 180);
  };

  return (
    <View style={[styles.deckContainer, { height: stackHeight }]}>
      {/* Render in reverse order so first card is on top */}
      {[...cards].reverse().map((card, reversedIndex) => {
        const originalIndex = cards.length - 1 - reversedIndex;
        const topOffset = originalIndex * STACK_OFFSET;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const animStyle = useAnimatedStyle(() => ({
          transform: [
            { translateY: translateYValues[originalIndex].value },
            { scale: scaleValues[originalIndex].value },
          ],
        }));

        return (
          <Animated.View
            key={card.id}
            style={[
              styles.cardWrapper,
              {
                top: topOffset,
                zIndex: originalIndex + 1,
              },
              animStyle,
            ]}
          >
            <Pressable
              onPress={() => handleCardPress(card, originalIndex)}
              style={styles.pressable}
            >
              <CreditCard
                card={card}
                subscriptions={subscriptions}
                size="hero"
                flippable={false}
              />
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  deckContainer: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  pressable: {
    width: '100%',
  },
});
