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
const VISIBLE_STACK_COUNT = 3;
const CONTROL_WIDTH = 48;
const CONTROL_GAP = 12;
const MAX_CARD_WIDTH = 760;
const MIN_CARD_WIDTH = 320;

interface StackedCardDeckProps {
  cards: Card[];
  subscriptions: Subscription[];
}

export function StackedCardDeck({ cards, subscriptions }: StackedCardDeckProps): React.JSX.Element {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [availableWidth, setAvailableWidth] = useState(0);

  const translateYValues = cards.map(() => useSharedValue(40));
  const scaleValues = cards.map(() => useSharedValue(1));
  const deckShift = useSharedValue(0);

  useEffect(() => {
    cards.forEach((_, i) => {
      translateYValues[i].value = withDelay(
        i * 80,
        withSpring(0, { damping: 15, stiffness: 120 })
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  useEffect(() => {
    if (activeIndex > cards.length - 1) {
      setActiveIndex(Math.max(cards.length - 1, 0));
    }
  }, [activeIndex, cards.length]);

  useEffect(() => {
    deckShift.value = withSpring(-(activeIndex * STACK_OFFSET), {
      damping: 18,
      stiffness: 140,
    });
  }, [activeIndex, deckShift]);

  const cardWidth = useMemo(() => {
    if (availableWidth <= 0) return MAX_CARD_WIDTH;
    const widthForDeck = availableWidth - CONTROL_WIDTH - CONTROL_GAP;
    return Math.max(MIN_CARD_WIDTH, Math.min(widthForDeck, MAX_CARD_WIDTH));
  }, [availableWidth]);

  const viewportHeight =
    CARD_HEIGHT + Math.min(Math.max(cards.length - 1, 0), VISIBLE_STACK_COUNT - 1) * STACK_OFFSET + 12;

  const stackHeight = CARD_HEIGHT + Math.max(cards.length - 1, 0) * STACK_OFFSET + 12;

  const handleCardPress = (card: Card, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scaleValues[index].value = withSpring(1.02, { damping: 12, stiffness: 200 });
    translateYValues[index].value = withSpring(-14, { damping: 12, stiffness: 200 });

    setTimeout(() => {
      scaleValues[index].value = withSpring(1, { damping: 15, stiffness: 120 });
      translateYValues[index].value = withSpring(0, { damping: 15, stiffness: 120 });
      router.push(`/subscriptions/${card.id}`);
    }, 180);
  };

  const handleMove = (direction: 'up' | 'down') => {
    if (cards.length <= 1) return;

    const nextIndex =
      direction === 'up'
        ? Math.max(activeIndex - 1, 0)
        : Math.min(activeIndex + 1, cards.length - 1);

    if (nextIndex === activeIndex) return;
    Haptics.selectionAsync();
    setActiveIndex(nextIndex);
  };

  const deckAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: deckShift.value }],
  }));

  return (
    <View
      style={styles.deckRow}
      onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
    >
      <View style={[styles.viewport, { width: cardWidth, height: viewportHeight }]}>
        <Animated.View style={[styles.stackLayer, { height: stackHeight }, deckAnimatedStyle]}>
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
                    cardWidth={cardWidth}
                  />
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={() => handleMove('up')}
          disabled={activeIndex === 0}
          style={[styles.controlButton, activeIndex === 0 && styles.controlButtonDisabled]}
        >
          <Text style={[styles.controlText, activeIndex === 0 && styles.controlTextDisabled]}>
            ^
          </Text>
        </Pressable>

        <Text style={styles.controlMeta}>
          {cards.length === 0 ? '0/0' : `${activeIndex + 1}/${cards.length}`}
        </Text>

        <Pressable
          onPress={() => handleMove('down')}
          disabled={activeIndex === cards.length - 1}
          style={[
            styles.controlButton,
            activeIndex === cards.length - 1 && styles.controlButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.controlText,
              activeIndex === cards.length - 1 && styles.controlTextDisabled,
            ]}
          >
            v
          </Text>
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
  viewport: {
    overflow: 'hidden',
  },
  stackLayer: {
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
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.45,
  },
  controlText: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '700',
  },
  controlTextDisabled: {
    color: COLORS.outline,
  },
  controlMeta: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
