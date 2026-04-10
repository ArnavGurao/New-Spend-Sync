import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CreditCard } from './CreditCard';
import { COLORS } from '../../constants/theme';
import type { Card, Subscription } from '../../store/useStore';

const CARD_HEIGHT = 192;
const STACK_OFFSET = 56;
const CONTROL_WIDTH = 52;
const CONTROL_GAP = 12;
const MAX_CARD_WIDTH = 760;
const MIN_CARD_WIDTH = 320;

interface StackedCardDeckProps {
  cards: Card[];
  subscriptions: Subscription[];
}

function rotateCards(cards: Card[], startIndex: number): Card[] {
  if (cards.length === 0) return [];
  const normalized = ((startIndex % cards.length) + cards.length) % cards.length;
  return [...cards.slice(normalized), ...cards.slice(0, normalized)];
}

export function StackedCardDeck({ cards, subscriptions }: StackedCardDeckProps): React.JSX.Element {
  const router = useRouter();
  const [rotationIndex, setRotationIndex] = useState(0);
  const [availableWidth, setAvailableWidth] = useState(0);

  const translateYValues = cards.map(() => useSharedValue(40));
  const scaleValues = cards.map(() => useSharedValue(1));

  useEffect(() => {
    cards.forEach((_, index) => {
      translateYValues[index].value = withDelay(
        index * 80,
        withSpring(0, { damping: 15, stiffness: 120 })
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  useEffect(() => {
    if (cards.length === 0) {
      setRotationIndex(0);
      return;
    }
    setRotationIndex((current) => ((current % cards.length) + cards.length) % cards.length);
  }, [cards.length]);

  const orderedCards = useMemo(() => rotateCards(cards, rotationIndex), [cards, rotationIndex]);

  const cardWidth = useMemo(() => {
    if (availableWidth <= 0) return MAX_CARD_WIDTH;
    const widthForDeck = availableWidth - CONTROL_WIDTH - CONTROL_GAP;
    return Math.max(MIN_CARD_WIDTH, Math.min(widthForDeck, MAX_CARD_WIDTH));
  }, [availableWidth]);

  const stackHeight = CARD_HEIGHT + Math.max(orderedCards.length - 1, 0) * STACK_OFFSET + 16;
  const currentPositionLabel =
    cards.length === 0 ? '0/0' : `${(((rotationIndex % cards.length) + cards.length) % cards.length) + 1}/${cards.length}`;

  const handleCardPress = (card: Card, originalIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scaleValues[originalIndex].value = withSpring(1.02, { damping: 12, stiffness: 200 });
    translateYValues[originalIndex].value = withSpring(-14, { damping: 12, stiffness: 200 });

    setTimeout(() => {
      scaleValues[originalIndex].value = withSpring(1, { damping: 15, stiffness: 120 });
      translateYValues[originalIndex].value = withSpring(0, { damping: 15, stiffness: 120 });
      router.push(`/subscriptions/${card.id}`);
    }, 180);
  };

  const handleRotate = (direction: 'up' | 'down') => {
    if (cards.length <= 1) return;

    Haptics.selectionAsync();
    setRotationIndex((current) =>
      direction === 'up'
        ? (current + 1) % cards.length
        : (current - 1 + cards.length) % cards.length
    );
  };

  return (
    <View
      style={styles.deckRow}
      onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
    >
      <View style={[styles.deckContainer, { width: cardWidth, height: stackHeight }]}>
        {orderedCards.map((card, positionIndex) => {
          const originalIndex = cards.findIndex((item) => item.id === card.id);

          // eslint-disable-next-line react-hooks/rules-of-hooks
          const animStyle = useAnimatedStyle(() => ({
            transform: [
              { translateY: translateYValues[originalIndex]?.value ?? 0 },
              { scale: scaleValues[originalIndex]?.value ?? 1 },
            ],
          }));

          return (
            <Animated.View
              key={`${card.id}-${positionIndex}`}
              style={[
                styles.cardWrapper,
                {
                  top: positionIndex * STACK_OFFSET,
                  zIndex: orderedCards.length - positionIndex,
                },
                animStyle,
              ]}
            >
              <Pressable onPress={() => handleCardPress(card, originalIndex)} style={styles.pressable}>
                <CreditCard
                  card={card}
                  subscriptions={subscriptions}
                  size="hero"
                  flippable={false}
                  cardWidth={cardWidth}
                />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={() => handleRotate('up')}>
          <Text style={styles.controlText}>↑</Text>
        </Pressable>

        <Text style={styles.controlMeta}>{currentPositionLabel}</Text>

        <Pressable style={styles.controlButton} onPress={() => handleRotate('down')}>
          <Text style={styles.controlText}>↓</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deckRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: CONTROL_GAP,
  },
  deckContainer: {
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
  controls: {
    width: CONTROL_WIDTH,
    paddingTop: 10,
    alignItems: 'center',
    gap: 10,
  },
  controlButton: {
    width: CONTROL_WIDTH,
    height: CONTROL_WIDTH,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '700',
  },
  controlMeta: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
